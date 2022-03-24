import { config } from 'src/config';
import { ConnectionOptions, createConnection } from 'typeorm';

export const connectionOption: ConnectionOptions = {
    type: 'mysql',
    host: config.database.host,
    port: +config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    entities: [
    ],
    synchronize: false,
    logging: config.nodeEnv === 'local',
    charset: 'utf8mb4_unicode_ci',
};

export const databaseConnection = createConnection(connectionOption);
