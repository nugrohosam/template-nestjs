import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { IndexRequest } from 'src/common/request/index.request';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { IndexPartyJoinRequestApplication } from '../applications/index-party-join-request.application';
import { RequestJoinPartyApplication } from '../applications/request-join-party.application';
import { UpdateJoinRequestStatusApplication } from '../applications/update-join-request-status.application';
import { JoinRequestRequest } from '../requests/join-request/join-request.request';
import { UpdateStatusJoinRequestRequest } from '../requests/join-request/update-status-join-request.request';
import { JoinRequestResponse } from '../responses/join-request/join-request.response';
import { GetPartyService } from '../services/get-party.service';
import { GetJoinRequestService } from '../services/join-request/get-join-request.service';

@Controller('parties/:partyId/join-requests')
export class PartyJoinRequestController {
    constructor(
        private readonly requestJoinApplication: RequestJoinPartyApplication,
        private readonly indexPartyJoinRequestApplication: IndexPartyJoinRequestApplication,
        private readonly updateJoinRequestStatusApplication: UpdateJoinRequestStatusApplication,

        private readonly getPartyServie: GetPartyService,
        private readonly getUserService: GetUserService,
        private readonly getJoinRequestService: GetJoinRequestService,
    ) {}

    @Post()
    async request(
        @Param('partyId') partyId: string,
        @Body() request: JoinRequestRequest,
    ): Promise<IApiResponse<JoinRequestResponse>> {
        const party = await this.getPartyServie.getById(partyId);
        const user = await this.getUserService.getUserByAddress(
            request.userAddress,
        );

        const joinRequest = await this.requestJoinApplication.call(
            user,
            party,
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
        const { data, meta } =
            await this.indexPartyJoinRequestApplication.fetch(partyId, query);

        const response = data.map((datum) => {
            return JoinRequestResponse.mapFromJoinRequestModel(datum);
        });

        return {
            message: "Success get party's join requests",
            data: response,
            meta,
        };
    }

    @Put(':joinRequestId')
    async updateStatus(
        @Param('joinRequestId') joinRequestId: string,
        @Body() request: UpdateStatusJoinRequestRequest,
    ): Promise<IApiResponse<JoinRequestResponse>> {
        let joinRequest = await this.getJoinRequestService.getById(
            joinRequestId,
        );
        joinRequest = await this.updateJoinRequestStatusApplication.call(
            joinRequest,
            request,
        );
        return {
            message: 'Success update join party request status',
            data: JoinRequestResponse.mapFromJoinRequestModel(joinRequest),
        };
    }
}
