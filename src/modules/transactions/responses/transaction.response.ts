import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { ITransaction } from 'src/entities/transaction.entity';
import { TransactionModel } from 'src/models/transaction.model';

export class TransactionResponse
    implements
        Omit<
            ITransaction,
            | 'currencyId'
            | 'signature'
            | 'transactionHash'
            | 'transactionHashStatus'
        >
{
    id: string;
    addressFrom: string;
    addressTo: string;
    amount: string;
    type: TransactionTypeEnum;
    description: string;
    createdAt: Date;

    static mapFromTransactionModel(
        transaction: TransactionModel,
    ): TransactionResponse {
        return {
            id: transaction.id,
            addressFrom: transaction.addressFrom,
            addressTo: transaction.addressTo,
            amount: transaction.amount.toString(),
            type: transaction.type,
            description: transaction.description,
            createdAt: transaction.createdAt,
        };
    }
}
