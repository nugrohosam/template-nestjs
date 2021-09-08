import BN from 'bn.js';

export interface IPartyToken {
    id: string;
    partyId: string;
    symbol: string;
    address: string;
    balance: BN;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
