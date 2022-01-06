import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { TransactionSyncModel } from 'src/models/transaction-sync.model';
import { ITransactionSync } from 'src/entities/transaction-sync.entity';
import { Propagation, Transactional } from 'typeorm-transactional-cls-hooked';

export enum SyncEnumOptions {
    All = 'All',
    IsSync = 'IsSync',
    IsNotSync = 'IsNotSync',
}

@Injectable()
export class TransactionSyncService {
    constructor(
        @InjectRepository(TransactionSyncModel)
        private readonly repository: Repository<TransactionSyncModel>,
    ) {}

    async get(
        option: SyncEnumOptions = SyncEnumOptions.All,
    ): Promise<TransactionSyncModel[]> {
        const query = this.repository.createQueryBuilder('trx');

        switch (option) {
            case SyncEnumOptions.IsSync:
                query.where('trx.is_sync= :isSync', {
                    isSync: true,
                });
                break;
            case SyncEnumOptions.IsNotSync:
                query.where('trx.is_sync= :isSync', {
                    isSync: false,
                });
                break;
            default:
                break;
        }
        return query.getMany();
    }

    /**
     * @info will ignore any current transaction and keep saving the data.
     */
    @Transactional({ propagation: Propagation.NOT_SUPPORTED })
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
