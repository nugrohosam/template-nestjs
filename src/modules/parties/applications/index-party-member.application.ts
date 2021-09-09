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
        const query = this.repository
            .createQueryBuilder('partyMember')
            .innerJoinAndSelect('partyMember.member', 'member')
            .innerJoinAndSelect('partyMember.party', 'party')
            .where('partyMember.party_id = :partyId', {
                partyId: request.party.id,
            });

        if (request.status) {
            if (request.status === MemberStatusEnum.InActive) {
                query.where('partyMember.deleted_at is not null');
            } else {
                query.where('partyMember.deleted_at is null');
            }
        }

        query.orderBy(
            request.sort
                ? `partyMember.${request.sort}`
                : 'partyMember.createdAt',
            request.order ?? this.DefaultOrder,
        );
        query.limit(request.perPage ?? this.DefaultPerPage);
        query.offset(this.countOffset(request));

        const [data, count] = await query.getManyAndCount();
        return {
            data: data,
            meta: this.mapMeta(count, request),
        };
    }
}
