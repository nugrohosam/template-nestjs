import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { Repository } from 'typeorm';

@Injectable()
export class GetPartyService {
    constructor(
        @InjectRepository(PartyModel)
        private readonly repository: Repository<PartyModel>,
    ) {}

    async getById(partyId: string, userId?: string): Promise<PartyModel> {
        const query = this.repository.createQueryBuilder('parties');
        query.setParameters({ partyId, userId });

        const isActiveQuery = query
            .subQuery()
            .select('p.id')
            .from(PartyModel, 'p')
            .leftJoin(PartyMemberModel, 'pm', 'pm.party_id = parties.id')
            .where('p.id = parties.id')
            .andWhere('pm.member_id = parties.owner_id')
            .andWhere('parties.address is not null')
            .andWhere('parties.transaction_hash is not null')
            .take(1)
            .getQuery();
        query.addSelect(`(${isActiveQuery}) is not null`, 'parties_isActive');

        const isMemberQuery = query
            .subQuery()
            .select('pm.id')
            .from(PartyMemberModel, 'pm')
            .where('pm.party_id = parties.id')
            .where('pm.member_id = :userId')
            .take(1)
            .getQuery();
        query.addSelect(`(${isMemberQuery}) is not null`, 'parties_isMember');

        query.where('id = :partyId');

        const party = await query.getOne();
        if (!party) throw new NotFoundException('Party not found.');

        return party;
    }

    async getByAddress(address: string): Promise<PartyModel> {
        const party = await this.repository.findOne({
            where: { address },
        });
        if (!party) throw new NotFoundException('Party not found');
        return party;
    }

    async getByTransactionHash(transactionHash: string): Promise<PartyModel> {
        const party = await this.repository.findOne({
            where: { transactionHash },
        });
        if (!party) throw new NotFoundException('Party not found');
        return party;
    }
}
