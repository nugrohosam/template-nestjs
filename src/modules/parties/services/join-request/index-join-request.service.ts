import { Injectable } from '@nestjs/common';
import { WhereOptions } from 'sequelize';
import { Op } from 'sequelize';
import {
    PaginationResponse,
    SequelizePaginator,
} from 'sequelize-typescript-paginator';
import { JoinRequestStatusEnum } from 'src/common/enums/party.enum';
import { JoinRequestModel } from 'src/models/join-request.model';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { IndexJoinRequestRequest } from '../../requests/join-request/index-join-request.request';
import { JoinRequestResponse } from '../../responses/join-request/join-request.response';

@Injectable()
export class IndexJoinRequestService {
    private getWhereOptions(
        query: IndexJoinRequestRequest,
    ): WhereOptions<JoinRequestModel> {
        const whereOptions: WhereOptions<JoinRequestModel> = {};

        switch (query.status) {
            case JoinRequestStatusEnum.Accepted:
                whereOptions.acceptedAt = { [Op.ne]: null };
                whereOptions.rejectedAt = { [Op.eq]: null };
                break;
            case JoinRequestStatusEnum.Rejected:
                whereOptions.acceptedAt = { [Op.eq]: null };
                whereOptions.rejectedAt = { [Op.ne]: null };
                break;

            default:
                whereOptions.acceptedAt = { [Op.eq]: null };
                whereOptions.rejectedAt = { [Op.eq]: null };
                break;
        }

        return whereOptions;
    }

    async fetchByUserId(
        userId: string,
        query: IndexJoinRequestRequest,
    ): Promise<PaginationResponse<JoinRequestResponse>> {
        const { data, meta } = await SequelizePaginator.paginate(
            JoinRequestModel,
            {
                perPage: query.perPage ?? 10,
                page: query.page ?? 1,
                options: {
                    where: { userId, ...this.getWhereOptions(query) },
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
        query: IndexJoinRequestRequest,
    ): Promise<PaginationResponse<JoinRequestResponse>> {
        const { data, meta } = await SequelizePaginator.paginate(
            JoinRequestModel,
            {
                perPage: query.perPage ?? 10,
                page: query.page ?? 1,
                options: {
                    where: {
                        partyId,
                        ...this.getWhereOptions(query),
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
