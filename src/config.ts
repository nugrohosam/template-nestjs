import dotenv from 'dotenv';

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
        websocketProvider: process.env.RPC_SERVER_WS,
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
    defaultToken: {
        symbol: process.env.DEFAULT_TOKEN_SYMBOL ?? 'usdc',
        address: process.env.DEFAULT_TOKEN_ADDRESS,
    },

    api: {
        zerox: process.env.API_0X_URL,
    },
    fee: {
        platformFee: process.env.PLATFORM_FEE || 5,
        maxFeePercentage: process.env.MAX_FEE_PERCENTAGE || 1000,
    },
};
