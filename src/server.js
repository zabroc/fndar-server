import fs from 'fs';
import path from 'path';
import express from 'express';
import https from 'https';
import SocketIO from 'socket.io';

import bodyParser from 'body-parser';
import cors from 'cors';
import winston from 'winston';
import compression from 'compression';
import expressWinston from 'express-winston';

import config from './config';
import logger from './utils/logger';
import {hmacAuth} from './utils/auth';



//create server
const app = express();

var options = {
    key: config.ssl.key,
    cert: config.ssl.cert,
    requestCert: false,
    rejectUnauthorized: false
};

const server = https.Server(options, app);
const io = new SocketIO(server);



//all the middleware
app.use(cors());
app.use(compression());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//app.use(hmacAuth.unless({path: '/chat'}));


app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send(err.toString());
    } else {
        next()
    }
});

app.use(
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

app.use(function (req, res, next) {
    logger.info(req.url);
    req.io = io;
    next();
});

server.listen(config.server.port, err => {

    if (err) {
        logger.error(err);
        process.exit(1);
    }

    require('./utils/db');

    fs.readdirSync(path.join(__dirname, 'routes')).map(file => {
        require('./routes/' + file)(app, io);
    });

    logger.info(
        `app is now running on port ${config.server.port} in ${config.env} mode`
    );


});

module.exports = app;
