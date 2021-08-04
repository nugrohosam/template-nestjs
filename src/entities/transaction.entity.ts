import BN from 'bn.js';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';

export interface ITransaction {
    id?: string;
    addressFrom: string;
    addressTo: string;
    amount: BN | string;
    currencyId: number;
    type: TransactionTypeEnum;
    description?: string;
    signature: string;
    transactionHash: string;
    transactionHashStatus: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
