import { FindOptions } from 'sequelize';
import { IPaginateResponse } from 'src/common/interface/index.interface';
import { IParty } from 'src/entities/party.entity';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { IndexPartyRequest } from '../requests/index-party.request';
import { IndexPartyResponse } from '../responses/index-party.response';

export class IndexPartyService {
    // TODO: need to init this globaly
    private readonly DefaultLimit = 10;
    private readonly DefaultOffset = 0;

    getFilterOption(query: IndexPartyRequest): FindOptions<IParty> {
        const options: FindOptions<IParty> = {
            where: {},
        };

        if (query.ownerId) {
            options.where['ownerId'] = query.ownerId;
        }

        return options;
    }

    async getTotalParties(query: IndexPartyRequest): Promise<number> {
        const result = await PartyModel.count({
            where: { ...this.getFilterOption(query).where },
            include: [
                {
                    model: UserModel,
                    as: 'owner',
                    required: true,
                },
            ],
        });

        return result;
    }

    async getParties(query: IndexPartyRequest): Promise<PartyModel[]> {
        return await PartyModel.findAll({
            where: { ...this.getFilterOption(query).where },
            include: [
                {
                    model: UserModel,
                    as: 'owner',
                    required: true,
                },
            ],
            order: [[query.sort ?? 'created_at', query.order ?? 'desc']],
            limit: query.limit ?? this.DefaultLimit,
            offset: query.offset ?? this.DefaultOffset,
        });
    }

    mapParties(parties: PartyModel[]): Array<IndexPartyResponse> {
        return parties.map((party) => {
            return IndexPartyResponse.mapFromPartyModel(party);
        });
    }

    async fetch(
        query: IndexPartyRequest,
    ): Promise<IPaginateResponse<IndexPartyResponse>> {
        const parties = await this.getParties(query);
        const total = await this.getTotalParties(query);
        const responses = this.mapParties(parties);

        return {
            data: responses,
            meta: {
                limit: query.limit ?? this.DefaultLimit,
                offset: query.offset ?? this.DefaultOffset,
                total: total,
            },
        };
    }
}
