import { InjectRepository } from '@nestjs/typeorm';
import { IPaginateResponse } from 'src/common/interface/index.interface';
import { IndexRequest } from 'src/common/request/index.request';
import { IndexApplication } from 'src/infrastructure/applications/index.application';
import { JoinRequestModel } from 'src/models/join-request.model';
import { Repository } from 'typeorm';

export class IndexPartyJoinRequestApplication extends IndexApplication {
    constructor(
        @InjectRepository(JoinRequestModel)
        private readonly repository: Repository<JoinRequestModel>,
    ) {
        super();
    }

    async fetch(
        partyId: string,
        request: IndexRequest,
    ): Promise<IPaginateResponse<JoinRequestModel>> {
        const query = this.repository.createQueryBuilder('joinRequests');
        query.where('party_id = :partyId', { partyId });

        query.orderBy(
            request.sort ?? 'joinRequests.created_at',
            request.order ?? 'DESC',
        );
        query.take(request.perPage ?? this.DefaultPage);
        query.skip(this.countOffset(request));

        const [data, count] = await query.getManyAndCount();
        return {
            data,
            meta: this.mapMeta(count, request),
        };
    }
}
