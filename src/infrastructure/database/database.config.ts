import * as dotenv from 'dotenv';

dotenv.config();

export const databaseConfig = {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOSTNAME,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || 'mysql',
};
