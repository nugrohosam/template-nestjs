import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class GetPartyService {
    constructor(
        @InjectRepository(PartyModel)
        private readonly repository: Repository<PartyModel>,
    ) {}

    getBaseQuery(userId?: string): SelectQueryBuilder<PartyModel> {
        const query = this.repository.createQueryBuilder('party');
        query.leftJoinAndSelect(
            'party.creator',
            'creator',
            'creator.id = party.creator_id',
        );
        query.leftJoinAndSelect(
            'party.owner',
            'owner',
            'owner.id = party.owner_id',
        );

        const isActiveQuery = query
            .subQuery()
            .select('p.id')
            .from(PartyModel, 'p')
            .leftJoin(PartyMemberModel, 'pm', 'pm.party_id = p.id')
            .where('p.id = party.id')
            .andWhere('pm.member_id = party.owner_id')
            .andWhere('party.address is not null')
            .andWhere('party.transaction_hash is not null')
            .take(1)
            .getQuery();
        query.addSelect(`${isActiveQuery} is not null`, 'party_isActive');

        const isMemberQuery = query
            .subQuery()
            .select('pm.id')
            .from(PartyMemberModel, 'pm')
            .where('pm.party_id = party.id')
            .where('pm.member_id = :userId', { userId })
            .take(1)
            .getQuery();
        query.addSelect(`${isMemberQuery} is not null`, 'party_isMember');

        return query;
    }

    async getById(partyId: string, userId?: string): Promise<PartyModel> {
        const query = this.getBaseQuery(userId);
        query.where('party.id = :partyId', { partyId });

        const party = await query.getOne();
        if (!party) throw new NotFoundException('Party not found.');

        return party;
    }

    async getByAddress(address: string): Promise<PartyModel> {
        const query = this.getBaseQuery();
        query.where('party.address = :address', { address });

        const party = await query.getOne();
        if (!party) throw new NotFoundException('Party not found');

        return party;
    }

    async getByTransactionHash(transactionHash: string): Promise<PartyModel> {
        const query = this.getBaseQuery();
        query.where('party.transaction_hash = :transactionHash', {
            transactionHash,
        });

        const party = await query.getOne();
        if (!party) throw new NotFoundException('Party not found');

        return party;
    }
}
