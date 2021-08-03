import { FindOptions, WhereOptions } from 'sequelize';
import { IParty } from 'src/entities/party.entity';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { IndexPartyRequest } from '../requests/index-party.request';
import { IndexPartyResponse } from '../responses/index-party.response';
import { PaginationResponse } from 'sequelize-typescript-paginator';
import { Op } from 'sequelize';
import { PartyMemberModel } from 'src/models/party-member.model';

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
        }

        return {
            where,
            include: [
                {
                    model: UserModel,
                    as: 'owner',
                    required: true,
                },
                {
                    model: PartyMemberModel,
                    as: 'partyMembers',
                    required: true,
                },
            ],
        };
    }

    private mapParties(parties: PartyModel[]): Array<IndexPartyResponse> {
        return parties.map((party) => {
            return IndexPartyResponse.mapFromPartyModel(party);
        });
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
            subQuery: false,
        });
        const count = await PartyModel.count({
            ...this.getFindOptions(query),
            distinct: true,
        });
        const response = this.mapParties(rows);

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
