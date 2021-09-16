import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ITransaction } from 'src/entities/transaction.entity';
import { TransactionModel } from 'src/models/transaction.model';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class TransactionService {
    constructor(
        @InjectRepository(TransactionModel)
        private readonly repository: Repository<TransactionModel>,
    ) {}

    async store(data: ITransaction): Promise<TransactionModel> {
        const transaction = this.repository.create(data);
        return await this.repository.save(transaction);
    }

    async update(
        transaction: TransactionModel,
        data: ITransaction,
    ): Promise<TransactionModel> {
        transaction = Object.assign(transaction, data);
        this.repository.save(transaction);
        return transaction;
    }

    async updateTxHashStatus(
        txhash: string,
        status: boolean,
    ): Promise<UpdateResult> {
        return this.repository
            .createQueryBuilder()
            .update(TransactionModel)
            .set({ transactionHashStatus: status })
            .where('transaction_hash = :transaction_hash', {
                transaction_hash: txhash,
            })
            .execute();
    }
}
