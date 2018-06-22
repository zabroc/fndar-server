import fs from 'fs';

require('dotenv').config({ path: './.env' });

export default {
	env: process.env.NODE_ENV || 'development',
	server: {
        host: process.env.HOST,
        port: process.env.PORT,
    },
    ssl : {
        key: fs.readFileSync('../ssl/private.key'),
        cert: fs.readFileSync( '../ssl/ec2-35-171-163-179.crt' ),
    },
    database: {
        uri: process.env.DB_URI,
    },
    auth: {
        secret: 'hexaflourphenylbarbituel',
    },

};
