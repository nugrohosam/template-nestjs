import BN from 'bn.js';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';

export interface ITransaction {
    id?: string;
    addressFrom: string;
    addressTo: string;
    amount: BN;
    currencyId: number;
    type: TransactionTypeEnum;
    description?: string;
    signature: string;
    transactionHash?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
