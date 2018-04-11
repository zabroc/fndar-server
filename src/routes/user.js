import User from '../controllers/user';

module.exports = api => {
	api.route('/users/:userId').put(User.put);
	api.route('/users/').post(User.post);
	api.route('/users/:userId').delete(User.delete);
};
