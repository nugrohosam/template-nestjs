import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { IndexJoinRequestApplication } from '../applications/index-join-request.application';
import { IndexJoinRequestRequest } from '../requests/join-request/index-join-request.request';
import { JoinRequestResponse } from '../responses/join-request/join-request.response';

@Controller('join-requests')
export class JoinRequestController {
    constructor(
        private readonly indexJoinRequestApplication: IndexJoinRequestApplication,

        @Inject(GetUserService) private readonly getUserService: GetUserService,
    ) {}

    @Get(':userAddress')
    async indexByUser(
        @Param('userAddress') userAddress: string,
        @Query() request: IndexJoinRequestRequest,
    ): Promise<IApiResponse<JoinRequestResponse[]>> {
        const user = await this.getUserService.getUserByAddress(userAddress);
        const { data, meta } = await this.indexJoinRequestApplication.fetch(
            user,
            request,
        );

        const response = await Promise.all(
            data.map(async (datum) => {
                return await JoinRequestResponse.mapFromJoinRequestModel(datum);
            }),
        );

        return {
            message: 'Success fetch join requests.',
            data: response,
            meta,
        };
    }
}
