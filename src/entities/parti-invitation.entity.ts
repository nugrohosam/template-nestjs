export interface IPartyInvitation {
    id?: string;
    partyId: string;
    userAddress: string;
    acceptedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
