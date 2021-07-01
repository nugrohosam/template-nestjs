import { Body, Controller, Param, Post } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { InviteUserRequest } from '../requests/invite-user.request';
import { InvitePartyService } from '../services/invite-party.service';

@Controller('parties/:partyId/invitations')
export class PartyInvitationController {
    constructor(private readonly invitePartyService: InvitePartyService) {}

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
}
