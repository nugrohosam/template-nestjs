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
import { ProfileResponse } from 'src/modules/users/responses/profile.response';
import { IndexPartyMemberRequest } from '../requests/index-party-member.request';
import { JoinPartyRequest } from '../requests/join-party.request';
import { UpdatePartyMemberRequest } from '../requests/member/update-party-member.request';
import { JoinPartyResponse } from '../responses/join-party.response';
import { IndexPartyMemberService } from '../services/members/index-party-member.service';
import { JoinPartyService } from '../services/members/join-party.service';
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
    ) {}

    @Post('join')
    async join(
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

    @Put('join/:partyMemberId')
    async update(
        @Param('partyMemberId') partyMemberId: string,
        @Body() request: UpdatePartyMemberRequest,
    ): Promise<IApiResponse<null>> {
        await this.updatePartyMemberService.update(partyMemberId, request);
        return {
            message: 'Success update join party data',
            data: null,
        };
    }

    @Get('members')
    async members(
        @Param('partyId') partyId: string,
        @Query() query: IndexPartyMemberRequest,
    ): Promise<IApiResponse<ProfileResponse[]>> {
        const result = await this.indexPartyMemberService.fetch(partyId, query);

        return {
            message: 'Success get user members',
            ...result,
        };
    }
}
