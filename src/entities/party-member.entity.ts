import BN from 'bn.js';

export interface IPartyMember {
    id?: string;
    partyId: string;
    memberId: string;
    initialFund: BN;
    totalFund: BN;
    totalDeposit: BN;
    status: string;
    signature: string;
    transactionHash?: string;
    depositTransactionId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
