import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { IndexPartyResponse } from '../responses/index-party.response';

export class IndexPartyService {
    async fetch(): Promise<IndexPartyResponse[]> {
        const parties = await PartyModel.findAll({
            include: [
                {
                    model: UserModel,
                    as: 'owner',
                },
            ],
            order: [['created_at', 'desc']],
            limit: 10,
            offset: 0,
        });

        return parties.map((party) => {
            return IndexPartyResponse.mapFromPartyModel(party);
        });
    }
}
