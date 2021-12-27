import BigNumber from 'bignumber.js';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';

export interface ITransactionVolume {
    id?: string;
    partyId: string;
    transactionHash: string;
    type: TransactionTypeEnum;
    amountUsd: BigNumber | string;
    createdAt?: Date;
    updatedAt?: Date;
}
