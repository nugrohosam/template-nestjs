import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { AcceptInvitationRequest } from '../requests/invitation/accept-invitation.request';
import { IndexPartyInvitationRequest } from '../requests/invitation/index-party-invitation.request';
import { InviteUserRequest } from '../requests/invitation/invite-user.request';
import { IndexPartyInvitationResponse } from '../responses/invitation/index-party-invitation.response';
import { AcceptInvitationService } from '../services/invitation/accept-invitation.service';
import { IndexPartyInvitationService } from '../services/invitation/index-party-invitation.service';
import { InvitePartyService } from '../services/invitation/invite-party.service';

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
        @Body() request: AcceptInvitationRequest,
    ): Promise<IApiResponse<null>> {
        await this.acceptInvitationService.accept(
            invitationId,
            request.signature,
        );
        return {
            message: 'Success accept invitation',
            data: null,
        };
    }
}
