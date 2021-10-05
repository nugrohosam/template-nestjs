import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JoinRequestModel } from 'src/models/join-request.model';
import { PartyGainModel } from 'src/models/party-gain.model';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyTokenModel } from 'src/models/party-token.model';
import { PartyModel } from 'src/models/party.model';
import { Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class GetPartyService {
    constructor(
        @InjectRepository(PartyModel)
        private readonly partyRepository: Repository<PartyModel>,
        @InjectRepository(PartyTokenModel)
        private readonly partyTokenRepository: Repository<PartyTokenModel>,
        @InjectRepository(PartyGainModel)
        private readonly partyGainRepository: Repository<PartyGainModel>,
    ) {}

    getBaseQuery(userId?: string): SelectQueryBuilder<PartyModel> {
        const query = this.partyRepository.createQueryBuilder('party');
        query.leftJoinAndSelect('party.creator', 'creator');
        query.leftJoinAndSelect('party.owner', 'owner');

        const totalMemberQuery = query
            .subQuery()
            .select('count(pm.id) as count')
            .from(PartyMemberModel, 'pm')
            .where('pm.party_id = party.id')
            .getSql();
        query.addSelect(`${totalMemberQuery} as party_totalMember`);

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

        if (userId) {
            const isMemberQuery = query
                .subQuery()
                .select('pm.id')
                .from(PartyMemberModel, 'pm')
                .where('pm.party_id = party.id')
                .andWhere('pm.member_id = :userId', { userId })
                .take(1)
                .getQuery();
            query.addSelect(`${isMemberQuery} is not null`, 'party_isMember');

            const joinRequestStatusQuery = query
                .subQuery()
                .select(
                    `case
                        when jr.accepted_at is not null then 'accepted'
                        when jr.rejected_at is not null then 'rejected'
                        else 'pending'
                    end`,
                    'status',
                )
                .from(JoinRequestModel, 'jr')
                .where('jr.party_id = party.id')
                .andWhere('jr.user_id = :userId', { userId })
                .take(1)
                .getQuery();
            query.addSelect(
                `${joinRequestStatusQuery}`,
                'party_joinRequestStatus',
            );
        }

        query.andWhere('deleted_at is null');
        return query;
    }

    async getById(partyId: string, userId?: string): Promise<PartyModel> {
        const query = this.getBaseQuery(userId);
        query.where('party.id = :partyId', { partyId });

        const party = await query.getOne();
        if (!party) throw new NotFoundException('Party not found.');

        return party;
    }

    async getByAddress(address: string, required = true): Promise<PartyModel> {
        const query = this.getBaseQuery();
        query.where('party.address = :address', { address });

        const party = await query.getOne();
        if (required && !party) throw new NotFoundException('Party not found');

        return party;
    }

    async getByTransactionHash(
        transactionHash: string,
        required = true,
    ): Promise<PartyModel> {
        const query = this.getBaseQuery();
        query.where('party.transaction_hash = :transactionHash', {
            transactionHash,
        });

        const party = await query.getOne();
        if (required && !party) throw new NotFoundException('Party not found');

        return party;
    }

    async getPartyTokenByAddress(
        partyId: string,
        tokenAddress: string,
    ): Promise<PartyTokenModel> {
        return await this.partyTokenRepository
            .createQueryBuilder('partyToken')
            .where('party_id = :partyId', { partyId })
            .andWhere('address = :tokenAddress', { tokenAddress })
            .getOne();
    }

    async getCurrentPartyGain(partyId: string): Promise<PartyGainModel> {
        return await this.partyGainRepository
            .createQueryBuilder('partyGain')
            .where('party_id = :partyId', { partyId })
            .orderBy('date', 'DESC')
            .getOne();
    }
}
