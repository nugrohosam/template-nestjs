import { Module } from '@nestjs/common';
import { TransactionController } from './controllers/transaction.controller';
import { TransferService } from './services/transfer.service';

@Module({
    controllers: [TransactionController],
    providers: [TransferService],
})
export class TrasnactionModule {}
