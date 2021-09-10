import BN from 'bn.js';

export interface IPartyGain {
    id: string;
    partyId: string;
    date: Date;
    fund: BN;
    gain: BN;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
