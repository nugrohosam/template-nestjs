import { Sequelize } from 'sequelize-typescript';
import { UserModel } from 'src/models/user.model';
import { databaseConfig } from './database.config';

class DatabaseProviders {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private readonly _primeSequelize = new Sequelize({
        ...databaseConfig,
        ...{ logging: false },
    });
    private _databaseProviders = [
        {
            provide: 'DATABASE',
            useFactory: async () => {
                const config = {
                    ...databaseConfig,
                    ...{ logging: false },
                };
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const sequelize = new Sequelize(config);

                // init model to sequelize
                sequelize.addModels([UserModel]);

                await sequelize.sync();
                return sequelize;
            },
        },
        // do other database connection here
    ];

    getDatabaseProviders() {
        return this._databaseProviders;
    }

    getPrimeSequelize() {
        return this._primeSequelize;
    }
}

export const databaseProviders = new DatabaseProviders().getDatabaseProviders();
export const localDatabase = new DatabaseProviders().getPrimeSequelize();
