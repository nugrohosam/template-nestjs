import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PartyMemberModel } from 'src/models/party-member.model';
import { Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class GetPartyMemberService {
    constructor(
        @InjectRepository(PartyMemberModel)
        private readonly repository: Repository<PartyMemberModel>,
    ) {}

    getBaseQuery(): SelectQueryBuilder<PartyMemberModel> {
        return this.repository
            .createQueryBuilder('partyMember')
            .leftJoinAndSelect('partyMember.party', 'party')
            .leftJoinAndSelect('partyMember.member', 'member');
    }

    async getById(joinPartyId: string): Promise<PartyMemberModel> {
        const partyMember = await this.getBaseQuery()
            .where('partyMember.id = :joinPartyId', { joinPartyId })
            .getOne();

        if (!partyMember)
            throw new NotFoundException('Party member not found.');

        return partyMember;
    }

    async getByMemberParty(
        memberId: string,
        partyId: string,
        required = true,
    ): Promise<PartyMemberModel> {
        const partyMember = await this.getBaseQuery()
            .where('party_id = :partyId', { partyId })
            .andWhere('member_id = :memberId', { memberId })
            .getOne();

        if (required) {
            if (!partyMember)
                throw new NotFoundException('Party Member not found');
        }

        return partyMember;
    }

    async getByUserAndPartyAddress(
        userAddress: string,
        partyAddress: string,
    ): Promise<PartyMemberModel> {
        const partyMember = await this.getBaseQuery()
            .where('party.address = :partyAddress', { partyAddress })
            .andWhere('member.address = :userAddress', { userAddress })
            .getOne();

        if (!partyMember) throw new NotFoundException('Party member not found');

        return partyMember;
    }
}
