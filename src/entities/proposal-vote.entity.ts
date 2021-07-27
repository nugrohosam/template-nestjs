export interface IProposalVote {
    id?: string;
    proposalId: string;
    memberId: string;
    weight: bigint;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
