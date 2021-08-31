import { InjectRepository } from '@nestjs/typeorm';
import { MemberStatusEnum } from 'src/common/enums/party.enum';
import { IPaginateResponse } from 'src/common/interface/index.interface';
import { Utils } from 'src/common/utils/util';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { Repository } from 'typeorm';
import { IndexPartyMemberRequest } from '../requests/member/index-party-member.request';

export class IndexPartyMemberApplication {
    constructor(
        @InjectRepository(PartyMemberModel)
        private readonly repository: Repository<PartyMemberModel>,
    ) {}

    async fetch(
        party: PartyModel,
        request: IndexPartyMemberRequest,
    ): Promise<IPaginateResponse<PartyMemberModel>> {
        const query = this.repository.createQueryBuilder();
        query.setParameters({
            partyId: party.id,
        });
        query.where('party_id = :partyId');

        if (request.status) {
            if (request.status === MemberStatusEnum.InActive) {
                query.where('deleted_at is not null');
            } else {
                query.where('deleted_at is null');
            }
        }

        query.orderBy(request.sort ?? 'created_at', request.order ?? 'DESC');
        query.take(request.perPage ?? 10);
        query.skip(Utils.countOffset(request.page, request.perPage));

        const [data, count] = await query.getManyAndCount();
        return {
            data: data,
            meta: {
                page: request.page ?? 1,
                perPage: request.perPage ?? 10,
                total: count,
                totalPage: count / (request.perPage ?? 10),
            },
        };
    }
}
