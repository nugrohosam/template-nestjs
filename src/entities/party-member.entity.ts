export interface IPartyMember {
    id?: string;
    partyId: string;
    memberId: string;
    initialFund: bigint;
    totalFund: bigint;
    status: string;
    transactionHash?: string;
    depositTransactionId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
