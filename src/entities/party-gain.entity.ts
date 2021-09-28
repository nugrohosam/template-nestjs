import BN from 'bn.js';

export interface IPartyGain {
    id: string;
    partyId: string;
    fund: BN;
    gain: BN;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
