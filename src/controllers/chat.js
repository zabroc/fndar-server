import logger from '../utils/logger';

exports.connect = (req, res) => {
    const io = req.io;

    io.on('connection', function (socket) {
        logger.info('a user connected with id %s', socket.id);
        //logger.info(socket);

        socket.on('subscribe', function (room) {
            console.log('joining room', room);
            socket.join(room);
        });

        socket.on('send message', function (data) {
            console.log('sending room post', data.room);
            socket.broadcast.to(data.room).emit('conversation private post', {
                message: data.message
            });
        });
    });
};