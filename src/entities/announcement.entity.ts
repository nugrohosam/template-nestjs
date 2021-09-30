export interface IAnnouncement {
    id?: string;
    partyId: string;
    title: string;
    body: string;
    link?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
