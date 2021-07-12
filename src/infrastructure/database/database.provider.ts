import { Sequelize } from 'sequelize-typescript';
import { PartyInvitationModel } from 'src/models/party-invitation.model';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { TransactionModel } from 'src/models/transaction.model';
import { UserModel } from 'src/models/user.model';
import { WhitelistedAddressModel } from 'src/models/whitelisted-address.model';
import { databaseConfig } from './database.config';

class DatabaseProviders {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    private readonly _localSequelize = new Sequelize({
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
                sequelize.addModels([
                    UserModel,
                    WhitelistedAddressModel,
                    PartyModel,
                    PartyMemberModel,
                    PartyInvitationModel,
                    TransactionModel,
                ]);

                await sequelize.sync({ alter: true });
                return sequelize;
            },
        },
        // do other database connection here
    ];

    getDatabaseProviders() {
        return this._databaseProviders;
    }

    getLocalSequelize() {
        return this._localSequelize;
    }
}

export const databaseProviders = new DatabaseProviders().getDatabaseProviders();
export const localDatabase = new DatabaseProviders().getLocalSequelize();
