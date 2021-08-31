import BN from 'bn.js';

export interface IPartyMember {
    id?: string;
    partyId: string;
    memberId: string;
    initialFund: BN;
    totalFund: BN;
    totalDeposit: BN;
    signature: string;
    transactionHash?: string;
    depositTransactionId?: string;
    leavedAt?: Date;
    leaveTransactionHash?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
