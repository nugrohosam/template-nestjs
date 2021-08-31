import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginateResponse } from 'src/common/interface/index.interface';
import { Utils } from 'src/common/utils/util';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { GetSignerService } from 'src/modules/commons/providers/get-signer.service';
import { Repository } from 'typeorm';
import { IndexMePartyRequest } from '../requests/index-party.request';

export class MyPartiesApplication {
    constructor(
        @InjectRepository(PartyModel)
        private readonly repository: Repository<PartyModel>,
        @Inject(GetSignerService)
        private readonly getSignerService: GetSignerService,
    ) {}

    async call(
        request: IndexMePartyRequest,
        signature: string,
    ): Promise<IPaginateResponse<PartyModel>> {
        const user = await this.getSignerService.get(signature, true);

        const query = this.repository.createQueryBuilder('parties');
        query.setParameters({ userId: user.id });

        if (request.onlyOwner && !request.onlyMember) {
            query.where('owner_id = :userId');
        } else if (request.onlyMember && !request.onlyOwner) {
            query.where((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select('party_members.member_id')
                    .from(PartyMemberModel, 'party_members')
                    .where('party_members.party_id = parties.id')
                    .where('party_members.member_id = :userId')
                    .getQuery();
                return 'exists ' + subQuery;
            });
        } else {
            query.where((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select('party_members.member_id')
                    .from(PartyMemberModel, 'party_members')
                    .where('party_members.party_id = parties.id')
                    .where('party_members.member_id = :userId')
                    .getQuery();
                return 'exists ' + subQuery;
            });
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
                totalPage: count / request.perPage,
            },
        };
    }
}
