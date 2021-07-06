import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
    // App Environment
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT || '3000',

    // Database
    database: {
        dialect: 'mysql',
        host: process.env.DB_HOSTNAME,
        port: process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    },

    // Storage
    storage: {
        path: './storages',
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

    disableSignatureValidation:
        process.env.DISABLE_SIGNATURE_VALIDATION === 'true',
};
