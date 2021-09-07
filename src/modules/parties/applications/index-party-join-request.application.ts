import { InjectRepository } from '@nestjs/typeorm';
import { IPaginateResponse } from 'src/common/interface/index.interface';
import { IndexRequest } from 'src/common/request/index.request';
import { IndexApplication } from 'src/infrastructure/applications/index.application';
import { JoinRequestModel } from 'src/models/join-request.model';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
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
        query.leftJoinAndSelect(
            PartyModel,
            'party',
            'party.id = joinRequests.party_id',
        );
        query.leftJoinAndSelect(
            UserModel,
            'user',
            'user.id = joinRequests.user_id',
        );
        query.where('party_id = :partyId', { partyId });

        query.orderBy(
            request.sort ?? 'joinRequests.created_at',
            request.order ?? 'DESC',
        );
        query.take(request.perPage ?? this.DefaultPerPage);
        query.skip(this.countOffset(request));

        const [data, count] = await query.getManyAndCount();
        return {
            data,
            meta: this.mapMeta(count, request),
        };
    }
}
