import dotenv from 'dotenv';

dotenv.config();

export const config = {
    // App Environment
    nodeEnv: process.env.NODE_ENV,

    // Database
    database: {
        dialect: 'mysql',
        host: process.env.DB_HOSTNAME,
        port: process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    },

    // Services
    web3: {
        httpProvider: process.env.RPC_SERVER,
    },

    platform: {
        privateKey: process.env.PLATFORM_PRIVATE_KEY,
        address: process.env.PLATFORM_ADDRESS,
    },

    sentry: {
        dsn: process.env.SENTRY_DSN,
    },
};
