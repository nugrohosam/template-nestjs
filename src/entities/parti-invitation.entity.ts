export interface IPartyInvitation {
    id?: string;
    partyId: string;
    userAddress: string;
    acceptedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
}
