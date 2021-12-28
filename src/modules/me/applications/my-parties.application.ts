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
                    .andWhere('owner_id != :userId', { userId: user.id })
                    .getQuery();
                return 'exists ' + subQuery;
            });
        } else {
            // TODO: MASIH RESEARCH BOS
            // filter member
            // query.where((qb) => {
            //     const subQuery = qb
            //         .subQuery()
            //         .select('party_members.member_id')
            //         .from(PartyMemberModel, 'party_members')
            //         .where('party_members.party_id = parties.id')
            //         .andWhere('party_members.member_id = :userId', {
            //             userId: user.id,
            //         })
            //         .getQuery();
            //     return 'exists ' + subQuery;
            // });

            const isDraftQuery = query
                .subQuery()
                .select('p.id')
                .from(PartyModel, 'p')
                .leftJoin(PartyMemberModel, 'pm', 'pm.party_id = p.id')
                .where('p.id = parties.id')
                .andWhere('pm.member_id = parties.owner_id')
                .andWhere('parties.address is not null')
                .andWhere('parties.transaction_hash is not null')
                .andWhere('parties.is_closed =0')
                .take(1)
                .getQuery();

            const isMember = query
                .subQuery()
                .select('p.id')
                .from(PartyModel, 'p')
                .leftJoin(PartyMemberModel, 'pm', 'pm.party_id = p.id')
                .where('p.id = parties.id')
                .andWhere('pm.member_id = parties.owner_id')
                .take(1)
                .getQuery();
            // query.addSelect(`${isDraftQuery} is not null`, 'party_isActive');

            // is_active condition
            query.where(
                `${isMember} is not null OR (${isDraftQuery} is null AND parties.owner_id = :userId)`,
                { userId: user.id },
            );

            // is_closed condition
            // query.where(
            //     `parties.is_closed=0 OR (parties.is_closed=1 AND parties.owner_id = :userId)`,
            //     { userId: user.id },
            // );
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
