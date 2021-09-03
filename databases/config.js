var dotenv = require('dotenv');
dotenv.config();

module.exports = {
    type: 'mysql',
    host: process.env.DB_HOSTNAME,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: false,
    logging: false,
    entities: ['src/models/*.model.ts'],
    migrations: ['databases/migrations/*.ts'],
    subscribers: ['src/models/subscribers/*.subscribers.ts'],
    cli: {
        entitiesDir: 'src/models',
        migrationsDir: 'databases/migrations',
        subscribersDir: 'src/models/subscribers',
    },
};
