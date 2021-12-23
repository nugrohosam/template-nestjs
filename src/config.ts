import dotenv from 'dotenv';

dotenv.config();

export const config = {
    /**
     * server configuration
     */
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT || '3000',

    /**
     * database configuration
     */
    database: {
        dialect: 'mysql',
        host: process.env.DB_HOSTNAME,
        port: process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    },

    /**
     * storage configuration for file uploads
     */
    storage: {
        path: './storages',
    },

    /**
     * ethereum javascript library
     */
    web3: {
        httpProvider: process.env.RPC_SERVER,
        websocketProvider: process.env.RPC_SERVER_WS,
    },

    /**
     * platforms information goes here
     */
    platform: {
        privateKey: process.env.PLATFORM_PRIVATE_KEY,
        address: process.env.PLATFORM_ADDRESS,
    },

    /**
     * online error log service credentials
     */
    sentry: {
        dsn: process.env.SENTRY_DSN,
    },

    /**
     * disable signature validation
     */
    disableSignatureValidation:
        process.env.DISABLE_SIGNATURE_VALIDATION === 'true',

    /**
     * platform default token for each party.
     * used when user create party, deposit, withdraw.
     */
    defaultToken: {
        symbol: process.env.DEFAULT_TOKEN_SYMBOL ?? 'usdc',
        address: process.env.DEFAULT_TOKEN_ADDRESS,
        geckoTokenId: process.env.DEFAULT_TOKEN_ID,
    },

    /**
     * all external api goes here
     */
    api: {
        zerox: process.env.API_0X_URL,
        gecko: process.env.API_GECKO_URL,
    },

    /**
     * used for every calucation on application
     */
    calculation: {
        usdDecimal: 100,
        /**
         * percentage wei is used for fixed percentage value until 2 precision
         * ex: 10 ** 4 or 10000
         * 100%    = 1        = 1000000
         * 1%      = 0.01     = 10000
         * 0.01%   = 0.0001   = 100
         * 0.0001% = 0.000001 = 1
         */
        percentageWei: +process.env.MAX_FEE_PERCENTAGE / 100 || 10000,

        /**
         * 100% in percentageWei based on percentageWei value
         */
        maxPercentage: +process.env.MAX_FEE_PERCENTAGE || 1000000,

        /**
         * used to charge each user transaction on platform
         * value must in percentage wei as defined in percentageWei
         */
        platformFee: +process.env.PLATFORM_FEE || 5000,
    },

    scheduler: {
        partyGain: process.env.PARTY_GAIN_SCHEDULER === 'true' || true,
        transactionSyncRetrial:
            process.env.TRANSACTION_SYNC_RETRIAL_SCHEDULER === 'true' || true,
    },
};
