import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import {
    PaginationResponse,
    SequelizePaginator,
} from 'sequelize-typescript-paginator';
import { IndexRequest } from 'src/common/request/index.request';
import { JoinRequestModel } from 'src/models/join-request.model';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { JoinRequestResponse } from '../../responses/join-request/join-request.response';

@Injectable()
export class IndexJoinRequestService {
    async fetchByUserId(
        userId: string,
        query: IndexRequest,
    ): Promise<PaginationResponse<JoinRequestResponse>> {
        const { data, meta } = await SequelizePaginator.paginate(
            JoinRequestModel,
            {
                perPage: query.perPage ?? 10,
                page: query.page ?? 1,
                options: {
                    where: { userId },
                    order: [
                        [query.sort ?? 'created_at', query.order ?? 'desc'],
                    ],
                    include: [
                        { model: PartyModel, as: 'party', required: true },
                    ],
                },
            },
        );

        const response = data.map((datum) =>
            JoinRequestResponse.mapFromJoinRequestModel(datum),
        );

        return {
            meta,
            data: response,
        };
    }

    async fetchByPartyId(
        partyId: string,
        query: IndexRequest,
    ): Promise<PaginationResponse<JoinRequestResponse>> {
        const { data, meta } = await SequelizePaginator.paginate(
            JoinRequestModel,
            {
                perPage: query.perPage ?? 10,
                page: query.page ?? 1,
                options: {
                    where: {
                        partyId,
                        acceptedAt: {
                            [Op.ne]: null,
                        },
                    },
                    order: [
                        [query.sort ?? 'created_at', query.order ?? 'desc'],
                    ],
                    include: [{ model: UserModel, as: 'user', required: true }],
                },
            },
        );

        const response = data.map((datum) =>
            JoinRequestResponse.mapFromJoinRequestModel(datum),
        );

        return {
            meta,
            data: response,
        };
    }
}
