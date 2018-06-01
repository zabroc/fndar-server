import fs from 'fs';
import path from 'path';
import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import bodyParser from 'body-parser';
import cors from 'cors';
import winston from 'winston';
import compression from 'compression';
import expressWinston from 'express-winston';

import config from './config';
import logger from './utils/logger';
import {hmacAuth} from './utils/auth';


const api = express();
const server = http.Server(api);
const io = new SocketIO(server);


//all the middleware
api.use(cors());
api.use(compression());
api.use(bodyParser.urlencoded({extended: true}));
api.use(bodyParser.json());



api.use((req, res, next) => {
    hmacAuth(req, res);
    next();
});


api.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send(err.toString());
    }
    next()
});



api.use(
    expressWinston.logger({
        transports: [
            new winston.transports.Console({
                json: true,
                colorize: true
            })
        ],
        meta: true
    })
);


api.use(function (req, res, next) {

    res.io = io;
    next();
});


api.listen(config.server.port, err => {

    if (err) {
        logger.error(err);
        process.exit(1);
    }

    require('./utils/db');

    fs.readdirSync(path.join(__dirname, 'routes')).map(file => {
        require('./routes/' + file)(api);
    });

    logger.info(
        `API is now running on port ${config.server.port} in ${config.env} mode`
    );


});


module.exports = api;
