import { SequelizeOptions } from 'sequelize-typescript';
import { Dialect } from 'sequelize/types';
import { config } from 'src/config';

export const databaseConfig: SequelizeOptions = {
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    host: config.database.host,
    port: +config.database.port,
    dialect: (config.database.dialect || 'mysql') as Dialect,
};
