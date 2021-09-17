import { PartyTokenModel } from 'src/models/party-token.model';

export class PartyTokenResponse {
    id: string;
    partyId: string;
    symbol: string;
    address: string;

    static mapFromPartyTokenModel(model: PartyTokenModel): PartyTokenResponse {
        return {
            id: model.id,
            partyId: model.partyId,
            symbol: model.symbol,
            address: model.address,
        };
    }
}
