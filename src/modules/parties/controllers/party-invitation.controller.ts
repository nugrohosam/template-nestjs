import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { IndexPartyInvitationRequest } from '../requests/index-party-invitation.request';
import { InviteUserRequest } from '../requests/invite-user.request';
import { IndexPartyInvitationResponse } from '../responses/index-party-invitation.response';
import { AcceptInvitationService } from '../services/accept-invitation.service';
import { IndexPartyInvitationService } from '../services/index-party-invitation.service';
import { InvitePartyService } from '../services/invite-party.service';

@Controller('parties/:partyId/invitations')
export class PartyInvitationController {
    constructor(
        private readonly invitePartyService: InvitePartyService,
        private readonly indexPartyInvitationService: IndexPartyInvitationService,
        private readonly acceptInvitationService: AcceptInvitationService,
    ) {}

    @Post()
    async invite(
        @Param('partyId') partyId: string,
        @Body() request: InviteUserRequest,
    ): Promise<IApiResponse<{ invitationId: string }>> {
        const invitation = await this.invitePartyService.invite(
            partyId,
            request,
        );
        return {
            message: 'Success create party invitation',
            data: {
                invitationId: invitation.id,
            },
        };
    }

    @Get()
    async index(
        @Param('partyId') partyId: string,
        @Query() query: IndexPartyInvitationRequest,
    ): Promise<IApiResponse<IndexPartyInvitationResponse[]>> {
        const result = await this.indexPartyInvitationService.fetch(
            partyId,
            query,
        );
        return {
            message: 'Success fetch party invitations',
            ...result,
        };
    }

    @Put(':invitationId')
    async accept(
        @Param('invitationId') invitationId: string,
        @Body('signature') signature: string,
    ): Promise<IApiResponse<null>> {
        await this.acceptInvitationService.accept(invitationId, signature);
        return {
            message: 'Success accept invitation',
            data: null,
        };
    }
}
