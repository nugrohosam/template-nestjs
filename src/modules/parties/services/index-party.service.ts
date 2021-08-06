import { FindOptions, WhereOptions } from 'sequelize';
import { IParty } from 'src/entities/party.entity';
import { PartyModel } from 'src/models/party.model';
import { IndexPartyRequest } from '../requests/index-party.request';
import { IndexPartyResponse } from '../responses/index-party.response';
import { PaginationResponse } from 'sequelize-typescript-paginator';
import { Op } from 'sequelize';
import { PartyMemberModel } from 'src/models/party-member.model';
import { OrderDirectionEnum } from 'src/common/enums/index.enum';

export class IndexPartyService {
    private getFindOptions(query: IndexPartyRequest): FindOptions<IParty> {
        const where: WhereOptions<IParty> = {
            isPublic: true,
            transactionHash: {
                [Op.ne]: null,
            },
            address: {
                [Op.ne]: null,
            },
        };

        if (query.ownerId) {
            where.ownerId = query.ownerId;
        } else {
            if (query.search) {
                where.name = {
                    [Op.like]: `%${query.search}%`,
                };
            }

            console.log(query.isFeatured);
            if (query.isFeatured) {
                where.isFeatured = query.isFeatured;
            }
        }

        return {
            where,
            include: [
                {
                    model: PartyMemberModel,
                    as: 'partyMembers',
                    required: true,
                },
            ],
            order: [
                [
                    query.sort ?? 'createdAt',
                    query.order ?? OrderDirectionEnum.Desc,
                ],
            ],
        };
    }

    private async mapParties(
        parties: PartyModel[],
    ): Promise<Array<IndexPartyResponse>> {
        return Promise.all(
            parties.map(async (party) => {
                return await IndexPartyResponse.mapFromPartyModel(party);
            }),
        );
    }

    async fetch(
        query: IndexPartyRequest,
    ): Promise<PaginationResponse<IndexPartyResponse>> {
        const limit = query.perPage ?? 10;
        const offset = query.page ? (query.page - 1) * limit : 0;
        const rows = await PartyModel.findAll({
            ...this.getFindOptions(query),
            limit,
            offset,
        });
        const count = await PartyModel.count({
            ...this.getFindOptions(query),
            distinct: true,
        });
        const response = await this.mapParties(rows);

        return {
            data: response,
            meta: {
                perPage: limit,
                page: query.page ?? 1,
                total: count,
                totalPage: Math.ceil(count / limit),
            },
        };
    }
}
