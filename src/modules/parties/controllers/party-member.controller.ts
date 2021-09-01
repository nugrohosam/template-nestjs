import {
    Body,
    Controller,
    Get,
    Inject,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { DeleteIncompleteDataRequest } from 'src/common/request/delete-incomplete-data.request';
import { IndexPartyMemberRequest } from '../requests/member/index-party-member.request';
import { JoinPartyRequest } from '../requests/member/join-party.request';
import { LeavePartyRequest } from '../requests/member/leave-party.request';
import { UpdatePartyMemberRequest } from '../requests/member/update-party-member.request';
import { JoinPartyResponse } from '../responses/member/join-party.response';
import { MemberDetailRespose } from '../responses/member/member-detail.response';
import { GetPartyMemberService } from '../services/members/get-party-member.service';
import { JoinPartyApplication } from '../applications/join-party.application';
import { GetPartyService } from '../services/get-party.service';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { IndexPartyMemberApplication } from '../applications/index-party-member.application';
import { LeavePartyApplication } from '../applications/leave-party.application';

@Controller('parties/:partyId')
export class PartyMemberController {
    constructor(
        private readonly joinPartyApplication: JoinPartyApplication,
        private readonly indexPartyMemberApplication: IndexPartyMemberApplication,
        private readonly leavePartyApplication: LeavePartyApplication,

        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
        @Inject(GetUserService)
        private readonly getUserService: GetUserService,
        @Inject(GetPartyMemberService)
        private readonly getPartyMemberService: GetPartyMemberService,
    ) {}

    @Post('join')
    async prepareJoinParty(
        @Param('partyId') partyId: string,
        @Body() request: JoinPartyRequest,
    ): Promise<IApiResponse<JoinPartyResponse>> {
        const party = await this.getPartyService.getById(partyId);
        const user = await this.getUserService.getUserByAddress(
            request.userAddress,
        );

        const { data, platformSignature } =
            await this.joinPartyApplication.prepare(party, user, request);

        return {
            message: 'Success add user to party',
            data: JoinPartyResponse.mapFromPartyMemberModel(
                data,
                platformSignature,
            ),
        };
    }

    @Put('join/:partyMemberId/transaction-hash')
    async commitJoinParty(
        @Param('partyMemberId') partyMemberId: string,
        @Body() request: UpdatePartyMemberRequest,
    ): Promise<IApiResponse<null>> {
        const partyMember = await this.getPartyMemberService.getById(
            partyMemberId,
        );
        await this.joinPartyApplication.commit(partyMember, request);
        return {
            message: 'Success update join party data',
            data: null,
        };
    }

    @Put('join/:partyMemberId/transaction-hash/revert')
    async revertJoinParty(
        @Param('partyMemberId') partyMemberId: string,
        @Body() request: DeleteIncompleteDataRequest,
    ): Promise<IApiResponse<null>> {
        const partyMember = await this.getPartyMemberService.getById(
            partyMemberId,
        );
        await this.joinPartyApplication.revert(partyMember, request);
        return {
            message: 'Success delete incomplete join party data',
            data: null,
        };
    }

    @Get('members')
    async members(
        @Param('partyId') partyId: string,
        @Query() request: IndexPartyMemberRequest,
    ): Promise<IApiResponse<MemberDetailRespose[]>> {
        const party = await this.getPartyService.getById(partyId);
        const { data, meta } = await this.indexPartyMemberApplication.fetch({
            party,
            ...request,
        });

        const response = await Promise.all(
            data.map(async (datum) => {
                return await MemberDetailRespose.mapFromPartyMemberModel(datum);
            }),
        );
        return {
            message: 'Success get user members',
            data: response,
            meta,
        };
    }

    @Get('members/:memberId')
    async detail(
        @Param('memberId') memberId: string,
    ): Promise<IApiResponse<MemberDetailRespose>> {
        const partyMember = await this.getPartyMemberService.getById(memberId);
        return {
            message: 'Success get user member detail',
            data: await MemberDetailRespose.mapFromPartyMemberModel(
                partyMember,
            ),
        };
    }

    @Get('users/:userId')
    async detailByUser(
        @Param('partyId') partyId: string,
        @Param('userId') userId: string,
    ): Promise<IApiResponse<MemberDetailRespose>> {
        const partyMember = await this.getPartyMemberService.getByMemberParty(
            userId,
            partyId,
        );
        return {
            message: 'Success get user member detail',
            data: await MemberDetailRespose.mapFromPartyMemberModel(
                partyMember,
            ),
        };
    }

    @Put('leave')
    async leave(
        @Param('partyId') partyId: string,
        @Body() request: LeavePartyRequest,
    ): Promise<IApiResponse<null>> {
        const user = await this.getUserService.getUserByAddress(
            request.userAddress,
        );
        const partyMember = await this.getPartyMemberService.getByMemberParty(
            user.id,
            partyId,
        );
        await this.leavePartyApplication.call(partyMember, request);
        return {
            message: 'Success leaving party',
            data: null,
        };
    }

    @Put('leave/revert')
    async revertLeave(
        @Param('partyId') partyId: string,
        @Body() request: LeavePartyRequest,
    ): Promise<IApiResponse<null>> {
        const user = await this.getUserService.getUserByAddress(
            request.userAddress,
        );
        const partyMember = await this.getPartyMemberService.getByMemberParty(
            user.id,
            partyId,
        );
        await this.leavePartyApplication.revert(partyMember);
        return {
            message: 'Success revert leave party action',
            data: null,
        };
    }
}
