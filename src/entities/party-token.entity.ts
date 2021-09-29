export interface IPartyToken {
    id: string;
    partyId: string;
    symbol: string;
    address: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export interface IPartyTokenBalance extends IPartyToken {
    balance: string;
}
