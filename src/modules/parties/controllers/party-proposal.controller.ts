import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { IndexRequest } from 'src/common/request/index.request';
import { CreateProposalRequest } from '../requests/proposal/create-proposal.request';
import { UpdateProposalTransactionRequest } from '../requests/proposal/update-proposal-transaction.request';
import { IndexProposalResponse } from '../responses/proposal/index-proposal.response';
import { CreateProposalService } from '../services/proposal/create-proposal.service';
import { IndexProposalService } from '../services/proposal/index-proposal.service';
import { UpdateProposalTransactionService } from '../services/proposal/update-proposal-transaction.service';

@Controller('parties/:partyId/proposals')
export class PartyProposalController {
    constructor(
        private readonly createProposalService: CreateProposalService,
        private readonly indexProposalService: IndexProposalService,
        private readonly updateProposalTransactionService: UpdateProposalTransactionService,
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

    @Put(':proposalId/transaction-hash')
    async updateTransactionHash(
        @Param('proposalId') proposalId: string,
        @Body() request: UpdateProposalTransactionRequest,
    ): Promise<IApiResponse<{ id: string }>> {
        const { id } = await this.updateProposalTransactionService.update(
            proposalId,
            request,
        );
        return {
            message: 'Success update proposal transaction hash',
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
