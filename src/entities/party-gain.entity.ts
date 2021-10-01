import BN from 'bn.js';

export interface IPartyGain {
    id: string;
    partyId: string;
    fund: BN;
    gain: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
