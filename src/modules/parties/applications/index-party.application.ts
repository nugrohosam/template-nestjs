import { InjectRepository } from '@nestjs/typeorm';
import { IPaginateResponse } from 'src/common/interface/index.interface';
import { GainPeriod } from 'src/entities/party.entity';
import { IndexApplication } from 'src/infrastructure/applications/index.application';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { Repository } from 'typeorm';
import { IndexPartyRequest } from '../requests/index-party.request';

export class IndexPartyApplication extends IndexApplication {
    constructor(
        @InjectRepository(PartyModel)
        private readonly repository: Repository<PartyModel>,
    ) {
        super();
    }

    async fetch(
        request: IndexPartyRequest,
    ): Promise<IPaginateResponse<PartyModel>> {
        const query = this.repository.createQueryBuilder('party');

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
        query.where(`${isActiveQuery} is not null`);

        if (request.search) {
            query.andWhere('party.name like "%:search%"', {
                search: request.search,
            });
        }

        if (request.isFeatured) {
            query.andWhere('party.is_featured = :isFeatured', {
                isFeatured: request.isFeatured,
            });
        }

        if (request.name) {
            // will filter the exac name of the party
            query.andWhere('name = :name', { name: request.name });
        }

        query.andWhere('is_public = true');
        query.andWhere('deleted_at is null');

        // handle special case for sorting perties
        if (request.sort === 'weeklyPerformance') {
            request.sort = `json_extract(gain, '$.${GainPeriod.Per7Days}')`;
        } else if (request.sort === 'lifeTimePerformance') {
            request.sort = `json_extract(gain, '$.${GainPeriod.LifeTime}')`;
        }

        query.orderBy(
            request.sort ?? 'party.createdAt',
            request.order ?? 'DESC',
        );

        query.take(request.perPage ?? 10);
        query.skip(this.countOffset(request));

        const [data, count] = await query.getManyAndCount();
        return {
            data: data,
            meta: this.mapMeta(count, request),
        };
    }
}
