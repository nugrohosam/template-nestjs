export interface IProposalDistribution {
    id?: string;
    proposalId: string;
    memberId: string;
    weight: bigint;
    amount: bigint;
    transactionHash?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
