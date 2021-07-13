export interface IJoinRequest {
    id?: string;
    userAddress: string;
    partyId: string;
    acceptedAt?: Date;
    rejectedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
