import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PartyMemberModel } from 'src/models/party-member.model';
import { Repository } from 'typeorm';

@Injectable()
export class GetPartyMemberService {
    constructor(
        @InjectRepository(PartyMemberModel)
        private readonly repository: Repository<PartyMemberModel>,
    ) {}

    async getById(joinPartyId: string): Promise<PartyMemberModel> {
        const partyMember = await this.repository.findOne({
            where: { id: joinPartyId },
        });

        if (!partyMember)
            throw new NotFoundException('Party member not found.');

        return partyMember;
    }

    async getByMemberParty(
        memberId: string,
        partyId: string,
    ): Promise<PartyMemberModel> {
        const partyMember = await this.repository.findOne({
            where: { partyId, memberId },
        });

        if (!partyMember) throw new NotFoundException('Party Member not found');

        return partyMember;
    }
}
