export interface IProposal {
    id?: string;
    partyId: string;
    title: string;
    description: string;
    contractAddress: string;
    attachmentUrl: string;
    voteStart: Date;
    voteEnd: Date;
    projectStart: Date;
    projectEnd: Date;
    amount: bigint;
    currencyId: number;
    creatorId: string;
    signature: string;
    transactionHash?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
