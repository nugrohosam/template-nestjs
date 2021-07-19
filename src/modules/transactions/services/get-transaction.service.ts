import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionModel } from 'src/models/transaction.model';

@Injectable()
export class GetTransactionService {
    async getById(id: string): Promise<TransactionModel> {
        const transaction = await TransactionModel.findOne({ where: { id } });
        if (!transaction) throw new NotFoundException('Transation not found');
        return transaction;
    }
}
