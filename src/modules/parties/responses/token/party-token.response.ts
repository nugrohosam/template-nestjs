import { PartyTokenModel } from 'src/models/party-token.model';

export class PartyTokenResponse {
    id: string;
    partyId: string;
    symbol: string;
    geckoTokenId: string;
    address: string;

    static mapFromPartyTokenModel(model: PartyTokenModel): PartyTokenResponse {
        return {
            id: model.id,
            partyId: model.partyId,
            symbol: model.symbol,
            geckoTokenId: model.geckoTokenId,
            address: model.address,
        };
    }
}
