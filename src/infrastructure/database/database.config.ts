import { config } from 'src/config';

export const databaseConfig = {
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect || 'mysql',
};
