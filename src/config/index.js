require('dotenv').config({ path: './.env' });

export default {
	env: process.env.NODE_ENV || 'development',
	logger: {
		host: process.env.LOGGER_HOST, // Papertrail Logging Host
		port: process.env.LOGGER_PORT, // Papertrail Logging Port
	},
    server: {
        host: process.env.HOST,
        port: process.env.PORT,
    },
    database: {
        uri: process.env.DB_URI,
    },

};
