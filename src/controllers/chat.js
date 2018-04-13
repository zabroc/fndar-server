import logger from '../utils/logger';

exports.connect = (req, res) => {
    logger.info(res.io);

    res.io.on('connection', function(socket) {
        logger.info('a user connected with id %s', socket.id);
        //socket.emit("socketToMe", "users");

    });
    //res.send('respond with a resource.');
};