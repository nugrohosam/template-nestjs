import BN from 'bn.js';

export interface IProposalVote {
    id?: string;
    proposalId: string;
    memberId: string;
    weight: BN;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
