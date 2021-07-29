import BN from 'bn.js';

export interface IProposalDistribution {
    id?: string;
    proposalId: string;
    memberId: string;
    weight: BN;
    amount: BN;
    transactionHash?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
