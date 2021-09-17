import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { TransactionModel } from 'src/models/transaction.model';
import { Repository } from 'typeorm';

@Injectable()
export class GetTransactionService {
    constructor(
        @InjectRepository(TransactionModel)
        private readonly repository: Repository<TransactionModel>,
    ) {}

    async getById(id: string): Promise<TransactionModel> {
        const transaction = await this.repository.findOne({ where: { id } });
        if (!transaction) throw new NotFoundException('Transation not found');
        return transaction;
    }
    async getByTx(
        transactionHash: string,
        type?: TransactionTypeEnum,
    ): Promise<TransactionModel> {
        const typeWhere = type ? { type } : {};
        const transaction = await this.repository.findOne({
            where: { transactionHash, ...typeWhere },
        });
        if (!transaction) throw new NotFoundException('Transation not found');
        return transaction;
    }
}
