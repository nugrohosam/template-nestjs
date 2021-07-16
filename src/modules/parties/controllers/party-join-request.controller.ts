import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { IndexRequest } from 'src/common/request/index.request';
import { JoinRequestRequest } from '../requests/join-request/join-request.request';
import { UpdateStatusJoinRequestRequest } from '../requests/join-request/update-status-join-request.request';
import { JoinRequestResponse } from '../responses/join-request/join-request.response';
import { IndexJoinRequestService } from '../services/join-request/index-join-request.service';
import { RequestJoinService } from '../services/join-request/request-join.service';
import { UpdateStatusJoinRequestService } from '../services/join-request/update-status-join-request.service';

@Controller('parties/:partyId/join-requests')
export class PartyJoinRequestController {
    constructor(
        private readonly requestJoinService: RequestJoinService,
        private readonly indexJoinRequest: IndexJoinRequestService,
        private readonly updateStatusJoinRequestService: UpdateStatusJoinRequestService,
    ) {}

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

    @Get()
    async index(
        @Param('partyId') partyId: string,
        @Query() query: IndexRequest,
    ): Promise<IApiResponse<JoinRequestResponse[]>> {
        const { data, meta } = await this.indexJoinRequest.fetchByPartyId(
            partyId,
            query,
        );

        return {
            message: "Success get party's join requests",
            meta,
            data,
        };
    }

    @Put(':joinRequestId')
    async updateStatus(
        @Param('joinRequestId') joinRequestId: string,
        @Body() request: UpdateStatusJoinRequestRequest,
    ): Promise<IApiResponse<JoinRequestResponse>> {
        const joinRequest = await this.updateStatusJoinRequestService.call(
            joinRequestId,
            request,
        );
        return {
            message: 'Success update join party request status',
            data: JoinRequestResponse.mapFromJoinRequestModel(joinRequest),
        };
    }
}
