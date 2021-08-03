/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@nestjs/common';
import { Op, WhereOptions } from 'sequelize';
import { FindOptions } from 'sequelize';
import { PaginationResponse } from 'sequelize-typescript-paginator';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { IndexPartyResponse } from 'src/modules/parties/responses/index-party.response';
import { IndexMePartyRequest } from '../requests/index-party.request';

@Injectable()
export class MePartiesService {
    private getFindOptions(
        user: UserModel,
        query: IndexMePartyRequest,
    ): FindOptions<PartyModel> {
        let where: WhereOptions<PartyModel> = {
            [Op.or]: {
                ownerId: user.id,
                '$partyMembers.member_id$': user.id,
            },
        };

        if (query.onlyOwner && !query.onlyMember) {
            where = {
                [Op.and]: {
                    ownerId: user.id,
                    '$partyMembers.member_id$': user.id,
                },
            };
        } else if (!query.onlyOwner && query.onlyMember) {
            where = {
                [Op.and]: {
                    ownerId: { [Op.ne]: user.id },
                    '$partyMembers.member_id$': user.id,
                },
            };
        }

        const options: FindOptions<PartyModel> = {
            include: { all: true },
            where,
            order: [[query.sort ?? 'created_at', query.order ?? 'desc']],
        };

        return options;
    }

    private mapMeParties(parties: PartyModel[]): IndexPartyResponse[] {
        return parties.map((party) =>
            IndexPartyResponse.mapFromPartyModel(party),
        );
    }

    async fetch(
        user: UserModel,
        query: IndexMePartyRequest,
    ): Promise<PaginationResponse<IndexPartyResponse>> {
        const options = this.getFindOptions(user, query);
        const limit = query.perPage ?? 10;
        const offset = query.page ? (query.page - 1) * limit : 0;

        const count = await PartyModel.count({
            ...options,
            distinct: true,
        });
        const rows = await PartyModel.findAll({
            ...options,
            limit,
            offset,
            subQuery: false,
        });
        const data = this.mapMeParties(rows);

        return {
            data,
            meta: {
                page: query.page ?? 1,
                perPage: limit,
                total: count,
                totalPage: Math.ceil(count / limit),
            },
        };
    }
}
