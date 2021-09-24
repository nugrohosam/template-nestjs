import BN from 'bn.js';

export interface ISwapTransaction {
    id?: string;
    token_from: string;
    token_target: string;
    buy_amount: BN | string;
    sell_amount: BN | string;
    transactionHash: string;
    createdAt?: Date;
    updatedAt?: Date;
}
