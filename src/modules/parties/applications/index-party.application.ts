import { InjectRepository } from '@nestjs/typeorm';
import { IPaginateResponse } from 'src/common/interface/index.interface';
import { Utils } from 'src/common/utils/util';
import { PartyModel } from 'src/models/party.model';
import { Repository } from 'typeorm';
import { IndexPartyRequest } from '../requests/index-party.request';

export class IndexPartyApplication {
    constructor(
        @InjectRepository(PartyModel)
        private readonly repository: Repository<PartyModel>,
    ) {}

    async fetch(
        request: IndexPartyRequest,
    ): Promise<IPaginateResponse<PartyModel>> {
        const query = this.repository.createQueryBuilder('parties');

        if (request.search) {
            query.where('parties.name like "%:search%"', {
                search: request.search,
            });
        }

        if (request.isFeatured) {
            query.where('parties.is_featured = :isFeatured', {
                isFeatured: request.isFeatured,
            });
        }

        query.orderBy(
            request.sort ?? 'parties.created_at',
            request.order ?? 'DESC',
        );
        query.take(request.perPage ?? 10);
        query.skip(Utils.countOffset(request.page, request.perPage));

        const [data, count] = await query.getManyAndCount();
        return {
            data: data,
            meta: {
                page: request.page ?? 1,
                perPage: request.perPage ?? 10,
                total: count,
                totalPage: count / request.perPage,
            },
        };
    }
}
