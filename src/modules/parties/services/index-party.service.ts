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

export class IndexPartyService {
    getFindOptions(query: IndexPartyRequest): FindOptions<IParty> {
        const where: WhereOptions<IParty> = {};

        if (query.ownerId) {
            where['ownerId'] = query.ownerId;
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

    mapParties(parties: PartyModel[]): Array<IndexPartyResponse> {
        return parties.map((party) => {
            return IndexPartyResponse.mapFromPartyModel(party);
        });
    }

    async fetch(
        query: IndexPartyRequest,
    ): Promise<PaginationResponse<IndexPartyResponse>> {
        const { data, meta } = await SequelizePaginator.paginate(
            PartyModel,
            {
                perPage: 10,
                page: 1,
            },
            this.getFindOptions(query),
        );
        const response = this.mapParties(data);

        return {
            data: response,
            meta,
        };
    }
}
