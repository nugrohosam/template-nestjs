export interface IPartyMember {
    id?: string;
    partyId: string;
    memberId: string;
    initialFund: bigint;
    totalFund: bigint;
    status: string;
    transactionHash: string;
    createdAt?: Date | null;
    updatedAt?: Date | null;
    deletedAt?: Date | null;
}
