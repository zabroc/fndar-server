import Chat from '../controllers/chat';


module.exports = api => {
    api.route('/socket.io').get(Chat.connect);
};
