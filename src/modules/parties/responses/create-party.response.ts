import { PartyModel } from 'src/models/party.model';

export class CreatePartyResponse {
    id: string;
    platformSignature: string;

    static mapFromPartyModel(
        party: PartyModel,
        platformSignature: string,
    ): CreatePartyResponse {
        return {
            id: party.id,
            platformSignature,
        };
    }
}
