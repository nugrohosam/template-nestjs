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
import { IndexPartyMemberService } from '../services/members/index-party-member.service';
import { JoinPartyService } from '../services/members/join-party.service';
import { LeavePartyService } from '../services/members/leave-party.service';
import { UpdatePartyMemberService } from '../services/members/update-party-member.service';

@Controller('parties/:partyId')
export class PartyMemberController {
    constructor(
        @Inject(JoinPartyService)
        private readonly joinPartyService: JoinPartyService,
        @Inject(UpdatePartyMemberService)
        private readonly updatePartyMemberService: UpdatePartyMemberService,
        @Inject(IndexPartyMemberService)
        private readonly indexPartyMemberService: IndexPartyMemberService,
        @Inject(GetPartyMemberService)
        private readonly getPartyMemberService: GetPartyMemberService,
        @Inject(LeavePartyService)
        private readonly leavePartyService: LeavePartyService,
    ) {}

    @Post('join')
    async prepareJoinParty(
        @Param('partyId') partyId: string,
        @Body() request: JoinPartyRequest,
    ): Promise<IApiResponse<JoinPartyResponse>> {
        const partyMember = await this.joinPartyService.join(partyId, request);
        const platformSignature =
            await this.joinPartyService.generatePlatformSignature(partyMember);

        return {
            message: 'Success add user to party',
            data: JoinPartyResponse.mapFromPartyMemberModel(
                partyMember,
                platformSignature,
            ),
        };
    }

    @Put('join/:partyMemberId/transaction-hash')
    async updateIncompleteJoinParty(
        @Param('partyMemberId') partyMemberId: string,
        @Body() request: UpdatePartyMemberRequest,
    ): Promise<IApiResponse<null>> {
        await this.updatePartyMemberService.update(partyMemberId, request);
        return {
            message: 'Success update join party data',
            data: null,
        };
    }

    @Put('join/:partyMemberId/transaction-hash/revert')
    async deleteIncompleteJoinParty(
        @Param('partyMemberId') partyMemberId: string,
        @Body() request: DeleteIncompleteDataRequest,
    ): Promise<IApiResponse<null>> {
        await this.updatePartyMemberService.delete(partyMemberId, request);
        return {
            message: 'Success delete incomplete join party data',
            data: null,
        };
    }

    @Get('members')
    async members(
        @Param('partyId') partyId: string,
        @Query() query: IndexPartyMemberRequest,
    ): Promise<IApiResponse<MemberDetailRespose[]>> {
        const result = await this.indexPartyMemberService.fetch(partyId, query);

        return {
            message: 'Success get user members',
            ...result,
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

    @Put('leave')
    async leave(
        @Param('partyId') partyId: string,
        @Body() request: LeavePartyRequest,
    ): Promise<IApiResponse<{ id: string; deletedAt: Date }>> {
        const member = await this.leavePartyService.leave(partyId, request);
        return {
            message: 'Success leaving party',
            data: {
                id: member.id,
                deletedAt: member.deletedAt,
            },
        };
    }

    @Put('leave/revert')
    async revertLeave(
        @Param('partyId') partyId: string,
        @Body() request: LeavePartyRequest,
    ): Promise<IApiResponse<null>> {
        await this.leavePartyService.revert(partyId, request);
        return {
            message: 'Success revert leave party action',
            data: null,
        };
    }
}
