require('dotenv').config({ path: './.env' });

export default {
	env: process.env.NODE_ENV || 'development',
	server: {
        host: process.env.HOST,
        port: process.env.PORT,
    },
    database: {
        uri: process.env.DB_URI,
    },
    auth: {
        secret: 'hexaflourphenylbarbituel',
    },

};
