import { PartyModel } from 'src/models/party.model';

export class GetPartyService {
    async getPartyById(partyId: string): Promise<PartyModel> {
        return await PartyModel.findOne({
            include: [
                PartyModel.associations.creator,
                PartyModel.associations.owner,
            ],
            where: { id: partyId },
        });
    }
}
