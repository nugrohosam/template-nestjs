import { Injectable, NotFoundException } from '@nestjs/common';
import { PartyMemberModel } from 'src/models/party-member.model';

@Injectable()
export class GetPartyMemberService {
    async getById(joinPartyId: string): Promise<PartyMemberModel> {
        const partyMember = await PartyMemberModel.findOne({
            where: { id: joinPartyId },
        });

        if (!partyMember)
            throw new NotFoundException('Party member not found.');

        return partyMember;
    }
}
