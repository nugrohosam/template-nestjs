import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { ITransaction } from 'src/entities/transaction.entity';

export class TransactionResponse implements Omit<ITransaction, 'signature'> {
    id: string;
    addressFrom: string;
    addressTo: string;
    amount: bigint;
    currencyId: number;
    type: TransactionTypeEnum;
    description: string;
    createdAt: Date;
}
