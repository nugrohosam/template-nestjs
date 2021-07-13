import { Injectable } from '@nestjs/common';
import {
    PaginationResponse,
    SequelizePaginator,
} from 'sequelize-typescript-paginator';
import { IndexRequest } from 'src/common/request/index.request';
import { JoinRequestModel } from 'src/models/join-request.model';
import { JoinRequestResponse } from '../../responses/join-request/join-request.response';

@Injectable()
export class IndexJoinRequest {
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
                    where: { partyId },
                    order: [
                        [query.sort ?? 'created_at', query.order ?? 'desc'],
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
}
