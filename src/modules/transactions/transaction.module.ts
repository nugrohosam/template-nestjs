import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Web3Module } from 'src/infrastructure/web3/web3.module';
import { TransactionSyncModel } from 'src/models/transaction-sync.model';
import { TransactionModel } from 'src/models/transaction.model';
import { PartyModule } from '../parties/party.module';
import { UserModule } from '../users/user.module';
import { IndexTransactionApplication } from './applications/index-transaction.application';
import { GetTransactionService } from './services/get-transaction.service';
import { TransactionSyncService } from './services/transaction-sync.service';
import { TransactionService } from './services/transaction.service';

@Module({
    imports: [
        Web3Module,
        UserModule,
        forwardRef(() => PartyModule),
        TypeOrmModule.forFeature([TransactionModel, TransactionSyncModel]),
    ],
    controllers: [],
    providers: [
        IndexTransactionApplication,

        GetTransactionService,
        TransactionService,
        TransactionSyncService,
    ],
    exports: [
        TransactionService,
        GetTransactionService,
        TransactionSyncService,
    ],
})
export class TransactionModule {}
