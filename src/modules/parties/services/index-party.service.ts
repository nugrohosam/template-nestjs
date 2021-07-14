import { FindOptions, WhereOptions } from 'sequelize';
import { IParty } from 'src/entities/party.entity';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { IndexPartyRequest } from '../requests/index-party.request';
import { IndexPartyResponse } from '../responses/index-party.response';
import {
    PaginationResponse,
    SequelizePaginator,
} from 'sequelize-typescript-paginator';
import { Op } from 'sequelize';

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
        }

        return {
            where,
            include: [
                {
                    model: UserModel,
                    as: 'owner',
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
        const { data, meta } = await SequelizePaginator.paginate(PartyModel, {
            perPage: query.perPage ?? 10,
            page: query.page ?? 1,
            options: this.getFindOptions(query),
        });
        const response = this.mapParties(data);

        return {
            data: response,
            meta,
        };
    }
}
