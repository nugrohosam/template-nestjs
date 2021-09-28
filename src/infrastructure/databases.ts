import { config } from 'src/config';
import { AnnouncementModel } from 'src/models/announcement.model';
import { CurrencyModel } from 'src/models/currency.model';
import { GeckoCoinModel } from 'src/models/gecko-coin.model';
import { JoinRequestModel } from 'src/models/join-request.model';
import { PartyGainModel } from 'src/models/party-gain.model';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyTokenModel } from 'src/models/party-token.model';
import { PartyModel } from 'src/models/party.model';
import { ProposalDistributionModel } from 'src/models/proposal-distribution.model';
import { ProposalVoteModel } from 'src/models/proposal-vote.model';
import { ProposalModel } from 'src/models/proposal.model';
import { SwapTransactionModel } from 'src/models/swap-transaction.model';
import { TransactionModel } from 'src/models/transaction.model';
import { UserModel } from 'src/models/user.model';
import { ConnectionOptions, createConnection } from 'typeorm';

export const connectionOption: ConnectionOptions = {
    type: 'mysql',
    host: config.database.host,
    port: +config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    entities: [
        UserModel,
        PartyModel,
        PartyMemberModel,
        JoinRequestModel,
        TransactionModel,
        CurrencyModel,
        PartyTokenModel,
        PartyGainModel,
        ProposalModel,
        ProposalVoteModel,
        ProposalDistributionModel,
        GeckoCoinModel,
        SwapTransactionModel,
        AnnouncementModel,
    ],
    synchronize: false,
    logging: config.nodeEnv === 'local',
    charset: 'utf8mb4_unicode_ci',
};

export const databaseConnection = createConnection(connectionOption);
