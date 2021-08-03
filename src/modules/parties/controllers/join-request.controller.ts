import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { IndexJoinRequestRequest } from '../requests/join-request/index-join-request.request';
import { JoinRequestResponse } from '../responses/join-request/join-request.response';
import { IndexJoinRequestService } from '../services/join-request/index-join-request.service';

@Controller('join-requests')
export class JoinRequestController {
    constructor(
        private readonly indexJoinRequestService: IndexJoinRequestService,
        @Inject(GetUserService) private readonly getUserService: GetUserService,
    ) {}

    @Get(':userAddress')
    async indexByUser(
        @Param('userAddress') userAddress: string,
        @Query() query: IndexJoinRequestRequest,
    ): Promise<IApiResponse<JoinRequestResponse[]>> {
        const user = await this.getUserService.getUserByAddress(userAddress);
        const { data, meta } = await this.indexJoinRequestService.fetchByUserId(
            user.id,
            query,
        );
        return {
            message: 'Success fetch join requests.',
            meta,
            data,
        };
    }
}
