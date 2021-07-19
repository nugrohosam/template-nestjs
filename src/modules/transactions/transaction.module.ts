import { forwardRef, Module } from '@nestjs/common';
import { Web3Module } from 'src/infrastructure/web3/web3.module';
import { PartyModule } from '../parties/party.module';
import { UserModule } from '../users/user.module';
import { TransactionController } from './controllers/transaction.controller';
import { GetTransactionService } from './services/get-transaction.service';
import { TransferService } from './services/transfer.service';
import { UpdateTransferService } from './services/update-transfer.service';

@Module({
    imports: [Web3Module, UserModule, forwardRef(() => PartyModule)],
    controllers: [TransactionController],
    providers: [TransferService, GetTransactionService, UpdateTransferService],
    exports: [TransferService],
})
export class TransactionModule {}
