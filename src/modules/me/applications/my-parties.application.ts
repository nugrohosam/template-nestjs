import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginateResponse } from 'src/common/interface/index.interface';
import { IndexApplication } from 'src/infrastructure/applications/index.application';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { GetSignerService } from 'src/modules/commons/providers/get-signer.service';
import { Repository } from 'typeorm';
import { IndexMePartyRequest } from '../requests/index-party.request';

@Injectable()
export class MyPartiesApplication extends IndexApplication {
    constructor(
        @InjectRepository(PartyModel)
        private readonly repository: Repository<PartyModel>,
        private readonly getSignerService: GetSignerService,
    ) {
        super();
    }

    async fetch(
        request: IndexMePartyRequest,
        signature: string,
    ): Promise<IPaginateResponse<PartyModel>> {
        const user = await this.getSignerService.get(signature, true);
        const query = this.repository.createQueryBuilder('parties');

        if (request.onlyOwner && !request.onlyMember) {
            query.where('owner_id = :userId', { userId: user.id });
        } else if (request.onlyMember && !request.onlyOwner) {
            query.where((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select('party_members.member_id')
                    .from(PartyMemberModel, 'party_members')
                    .where('party_members.party_id = parties.id')
                    .andWhere('party_members.member_id = :userId', {
                        userId: user.id,
                    })
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
                    .andWhere('party_members.member_id = :userId', {
                        userId: user.id,
                    })
                    .getQuery();
                return 'exists ' + subQuery;
            });
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
