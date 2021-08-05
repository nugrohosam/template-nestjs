/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@nestjs/common';
import { QueryTypes } from 'sequelize';
import { Op, WhereOptions } from 'sequelize';
import { FindOptions } from 'sequelize';
import { PaginationResponse } from 'sequelize-typescript-paginator';
import { localDatabase } from 'src/infrastructure/database/database.provider';
import { PartyMemberModel } from 'src/models/party-member.model';
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
            include: [{ model: PartyMemberModel, as: 'partyMembers' }],
            where,
            order: [[query.sort ?? 'created_at', query.order ?? 'desc']],
        };

        return options;
    }

    private mapMeParties(parties: PartyModel[]): Promise<IndexPartyResponse[]> {
        return Promise.all(
            parties.map(
                async (party) =>
                    await IndexPartyResponse.mapFromPartyModel(party),
            ),
        );
    }

    async fetch(
        user: UserModel,
        query: IndexMePartyRequest,
    ): Promise<PaginationResponse<IndexPartyResponse>> {
        const limit = query.perPage ?? 10;
        const offset = query.page ? (query.page - 1) * limit : 0;

        let sql = `select * from parties `;
        if (query.onlyOwner) {
            sql += `where owner_id = '${user.id}' `;
        } else if (query.onlyMember) {
            sql += `where exists (
                select member_id from party_members
                where party_members.party_id = parties.id
                and party_members.member_id = '${user.id}'
            ) and owner_id != '${user.id}' `;
        } else {
            sql += `where exists (
                select member_id from party_members
                where party_members.party_id = parties.id
                and party_members.member_id = '${user.id}'
            ) `;
        }

        const count = (await localDatabase.query(sql + ';')).length;

        sql += `order by ${query.sort ?? 'created_at'} ${
            query.order ?? 'desc'
        } `;
        sql += `limit ${limit} offset ${offset};`;

        const rows = await localDatabase.query(sql, {
            type: QueryTypes.SELECT,
            model: PartyModel,
            mapToModel: true,
        });
        const data = await this.mapMeParties(rows);

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
