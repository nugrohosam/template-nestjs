export interface IJoinRequest {
    id?: string;
    userId: string;
    partyId: string;
    acceptedAt?: Date;
    rejectedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
