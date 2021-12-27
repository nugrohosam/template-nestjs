import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Web3Module } from 'src/infrastructure/web3/web3.module';
import { TransactionSyncModel } from 'src/models/transaction-sync.model';
import { TransactionVolumeModel } from 'src/models/transaction-volume.model';
import { TransactionModel } from 'src/models/transaction.model';
import { PartyModule } from '../parties/party.module';
import { UserModule } from '../users/user.module';
import { IndexTransactionApplication } from './applications/index-transaction.application';
import { GetTransactionService } from './services/get-transaction.service';
import { TransactionSyncService } from './services/transaction-sync.service';
import { TransactionVolumeService } from './services/transaction-volume.service';
import { TransactionService } from './services/transaction.service';

@Module({
    imports: [
        Web3Module,
        UserModule,
        forwardRef(() => PartyModule),
        TypeOrmModule.forFeature([
            TransactionModel,
            TransactionSyncModel,
            TransactionVolumeModel,
        ]),
    ],
    controllers: [],
    providers: [
        IndexTransactionApplication,

        GetTransactionService,
        TransactionService,
        TransactionSyncService,
        TransactionVolumeService,
    ],
    exports: [
        TransactionService,
        GetTransactionService,
        TransactionSyncService,
        TransactionVolumeService,
    ],
})
export class TransactionModule {}
