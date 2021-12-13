import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionSyncModel } from 'src/models/transaction-sync.model';
import { ITransactionSync } from 'src/entities/transaction-sync.entity';

@Injectable()
export class TransactionSyncService {
    constructor(
        @InjectRepository(TransactionSyncModel)
        private readonly repository: Repository<TransactionSyncModel>,
    ) {}

    async store(data: ITransactionSync): Promise<TransactionSyncModel> {
        const transactionSync = this.repository.create(data);
        return this.repository.save(transactionSync);
    }
}
