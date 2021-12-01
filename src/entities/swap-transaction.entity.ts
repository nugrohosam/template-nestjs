import BN from 'bn.js';

export interface ISwapTransaction {
    id?: string;
    partyId: string;
    tokenFrom: string;
    tokenTarget: string;
    buyAmount: BN | string;
    sellAmount: BN | string;
    usd: number;
    transactionHash: string;
    createdAt?: Date;
    updatedAt?: Date;
}
