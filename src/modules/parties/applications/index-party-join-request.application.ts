import { InjectRepository } from '@nestjs/typeorm';
import { JoinRequestStatusEnum } from 'src/common/enums/party.enum';
import { IPaginateResponse } from 'src/common/interface/index.interface';
import { IndexApplication } from 'src/infrastructure/applications/index.application';
import { JoinRequestModel } from 'src/models/join-request.model';
import { Repository } from 'typeorm';
import { IndexJoinRequestRequest } from '../requests/join-request/index-join-request.request';

export class IndexPartyJoinRequestApplication extends IndexApplication {
    constructor(
        @InjectRepository(JoinRequestModel)
        private readonly repository: Repository<JoinRequestModel>,
    ) {
        super();
    }

    async fetch(
        partyId: string,
        request: IndexJoinRequestRequest,
    ): Promise<IPaginateResponse<JoinRequestModel>> {
        const query = this.repository.createQueryBuilder('joinRequests');
        query.leftJoinAndSelect('joinRequests.party', 'party');
        query.leftJoinAndSelect('joinRequests.user', 'user');
        query.where('party_id = :partyId', { partyId });

        if (request.status) {
            switch (request.status) {
                case JoinRequestStatusEnum.Pending:
                    query.andWhere(
                        '(accepted_at is null and rejected_at is null)',
                    );
                    break;
                case JoinRequestStatusEnum.Accepted:
                    query.andWhere('accepted_at is not null');
                    break;
                case JoinRequestStatusEnum.Rejected:
                    query.andWhere('rejected_at is not null');
                    break;
                default:
                    break;
            }
        }

        query.orderBy(
            request.sort ?? 'joinRequests.createdAt',
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
