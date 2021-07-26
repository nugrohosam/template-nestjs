import { Body, Controller, Param, Post } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { CreateProposalRequest } from '../requests/proposal/create-proposal.request';
import { CreateProposalService } from '../services/proposal/create-proposal.service';

@Controller('parties/:partyId/proposals')
export class PartyProposalController {
    constructor(
        private readonly createProposalService: CreateProposalService,
    ) {}

    @Post()
    async store(
        @Param('partyId') partyId: string,
        @Body() request: CreateProposalRequest,
    ): Promise<IApiResponse<{ id: string }>> {
        const { id } = await this.createProposalService.create(
            partyId,
            request,
        );
        return {
            message: 'Success create proposal',
            data: { id },
        };
    }
}
