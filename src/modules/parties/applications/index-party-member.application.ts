import { InjectRepository } from '@nestjs/typeorm';
import { MemberStatusEnum } from 'src/common/enums/party.enum';
import { IPaginateResponse } from 'src/common/interface/index.interface';
import { IndexApplication } from 'src/infrastructure/applications/index.application';
import { PartyMemberModel } from 'src/models/party-member.model';
import { Repository } from 'typeorm';
import { IndexPartyMemberRequestWithParty } from '../requests/member/index-party-member.request';

export class IndexPartyMemberApplication extends IndexApplication {
    constructor(
        @InjectRepository(PartyMemberModel)
        private readonly repository: Repository<PartyMemberModel>,
    ) {
        super();
    }

    async fetch(
        request: IndexPartyMemberRequestWithParty,
    ): Promise<IPaginateResponse<PartyMemberModel>> {
        const query = this.repository.createQueryBuilder();
        query.where('party_id = :partyId', { partyId: request.party.id });

        if (request.status) {
            if (request.status === MemberStatusEnum.InActive) {
                query.where('deleted_at is not null');
            } else {
                query.where('deleted_at is null');
            }
        }

        query.orderBy(
            request.sort ?? this.DefaultSort,
            request.order ?? this.DefaultOrder,
        );
        query.take(request.perPage ?? this.DefaultPerPage);
        query.skip(this.countOffset(request));

        const [data, count] = await query.getManyAndCount();
        return {
            data: data,
            meta: this.mapMeta(count, request),
        };
    }
}
