import { NotFoundException } from '@nestjs/common';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';

export class GetPartyService {
    async getPartyById(partyId: string): Promise<PartyModel> {
        const party = await PartyModel.findOne({
            include: [
                {
                    model: UserModel,
                    as: 'creator',
                },
                {
                    model: UserModel,
                    as: 'owner',
                },
            ],
            where: { id: partyId },
        });

        if (!party) throw new NotFoundException('Party not found.');
        return party;
    }
}
