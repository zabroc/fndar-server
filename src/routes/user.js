import User from '../controllers/user';

module.exports = app => {
    app.route('/users/:userId').put(User.put);
    app.route('/users/').post(User.post);
    app.route('/users/:userId').delete(User.delete);
};
