import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { TransactionSyncModel } from 'src/models/transaction-sync.model';
import { ITransactionSync } from 'src/entities/transaction-sync.entity';

@Injectable()
export class TransactionSyncService {
    constructor(
        @InjectRepository(TransactionSyncModel)
        private readonly repository: Repository<TransactionSyncModel>,
    ) {}

    async get(isSync?: boolean): Promise<TransactionSyncModel[]> {
        const query = this.repository.createQueryBuilder('trx');

        if (isSync) {
            query.where('trx.is_sync= :isSync', {
                isSync,
            });
        }
        return query.getMany();
    }

    async store(data: ITransactionSync): Promise<TransactionSyncModel> {
        const transactionSync = this.repository.create(data);
        return this.repository.save(transactionSync);
    }

    async updateStatusSync(
        transactionHash: string,
        status: boolean,
    ): Promise<UpdateResult> {
        return this.repository
            .createQueryBuilder()
            .update(TransactionSyncModel)
            .set({ isSync: status })
            .where('transaction_hash = :transaction_hash', {
                transaction_hash: transactionHash,
            })
            .execute();
    }
}
