// Load environment variables from .env file
require('dotenv').config();

module.exports = {
    user: process.env.DB_USER || 'EL_BIGOTE', // Replace with your DB user or use env variables
    password: process.env.DB_PASSWORD || 'Bigote.12345', // Replace with your DB password or use env variables
    connectString: process.env.DB_CONNECTION_STRING || '(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.sa-saopaulo-1.oraclecloud.com))(connect_data=(service_name=gbd1c9beeaeef81_campiones_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))', // Replace with your DB connection string or use env variables
};
