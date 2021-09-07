import { InjectRepository } from '@nestjs/typeorm';
import { IPaginateResponse } from 'src/common/interface/index.interface';
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
            query.where('party.name like "%:search%"', {
                search: request.search,
            });
        }

        if (request.isFeatured) {
            query.where('party.is_featured = :isFeatured', {
                isFeatured: request.isFeatured,
            });
        }

        query.orderBy(
            request.sort ?? 'party.created_at',
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
