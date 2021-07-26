import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { IndexRequest } from 'src/common/request/index.request';
import { CreateProposalRequest } from '../requests/proposal/create-proposal.request';
import { IndexProposalResponse } from '../responses/proposal/index-proposal.response';
import { CreateProposalService } from '../services/proposal/create-proposal.service';
import { IndexProposalService } from '../services/proposal/index-proposal.service';

@Controller('parties/:partyId/proposals')
export class PartyProposalController {
    constructor(
        private readonly createProposalService: CreateProposalService,
        private readonly indexProposalService: IndexProposalService,
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

    @Get()
    async index(
        @Query() query: IndexRequest,
    ): Promise<IApiResponse<IndexProposalResponse[]>> {
        const { data, meta } = await this.indexProposalService.fetch(query);
        return {
            message: 'Success fetch proposal',
            meta,
            data,
        };
    }
}
