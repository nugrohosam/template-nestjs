import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
}
