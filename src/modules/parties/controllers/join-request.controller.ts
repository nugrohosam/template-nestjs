import { Body, Controller, Param, Post } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { JoinRequestRequest } from '../requests/join-request/join-request.request';
import { JoinRequestResponse } from '../responses/join-request/join-request.response';
import { RequestJoinService } from '../services/join-request/request-join.service';

@Controller('parties/:partyId/join-requests')
export class JoinRequestController {
    constructor(private readonly requestJoinService: RequestJoinService) {}

    @Post()
    async request(
        @Param('partyId') partyId: string,
        @Body() request: JoinRequestRequest,
    ): Promise<IApiResponse<JoinRequestResponse>> {
        const joinRequest = await this.requestJoinService.call(
            partyId,
            request,
        );

        return {
            message: 'Success request join a party.',
            data: JoinRequestResponse.mapFromJoinRequestModel(joinRequest),
        };
    }
}
