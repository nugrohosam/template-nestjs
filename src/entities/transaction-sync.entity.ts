import { PartyEvents } from 'src/contracts/Party';

export interface ITransactionSync {
    id?: string;
    transactionHash: string;
    eventName: PartyEvents;
    isSync: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
