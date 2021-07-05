import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';

export interface ITransaction {
    id?: string;
    addressFrom: string;
    addressTo: string;
    amount: bigint;
    currencyId: number;
    type: TransactionTypeEnum;
    description: string | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
    deletedAt?: Date | null;
}