import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { JoinPartyRequest } from '../requests/join-party.request';
import { JoinPartyResponse } from '../responses/join-party.response';
import { JoinPartyService } from '../services/join-party.service';

@Controller('parties/:partyId/join')
export class JoinPartyController {
    constructor(
        @Inject(JoinPartyService)
        private readonly joinPartyService: JoinPartyService,
    ) {}

    @Post()
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
}
