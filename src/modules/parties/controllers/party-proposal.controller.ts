import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { IndexRequest } from 'src/common/request/index.request';
import { CreateProposalRequest } from '../requests/proposal/create-proposal.request';
import { UpdateProposalStatusRequest } from '../requests/proposal/update-proposal-status.request';
import { UpdateProposalTransactionRequest } from '../requests/proposal/update-proposal-transaction.request';
import { DetailProposalResponse } from '../responses/proposal/detail-proposal.response';
import { IndexProposalResponse } from '../responses/proposal/index-proposal.response';
import { ApproveProposalService } from '../services/proposal/approve-proposal.service';
import { CreateProposalService } from '../services/proposal/create-proposal.service';
import { GetProposalService } from '../services/proposal/get-proposal.service';
import { IndexProposalService } from '../services/proposal/index-proposal.service';
import { RejectProposalService } from '../services/proposal/reject-proposal.service';
import { UpdateApprovedProposalService } from '../services/proposal/update-approved-proposal.service';
import { UpdateProposalTransactionService } from '../services/proposal/update-proposal-transaction.service';

@Controller('parties/:partyId/proposals')
export class PartyProposalController {
    constructor(
        private readonly createProposalService: CreateProposalService,
        private readonly indexProposalService: IndexProposalService,
        private readonly updateProposalTransactionService: UpdateProposalTransactionService,
        private readonly getProposalService: GetProposalService,
        private readonly approveProposalService: ApproveProposalService,
        private readonly rejectProposalService: RejectProposalService,
        private readonly updateApprovedProposalService: UpdateApprovedProposalService,
    ) {}

    @Post()
    async store(
        @Param('partyId') partyId: string,
        @Body() request: CreateProposalRequest,
    ): Promise<IApiResponse<{ id: string }>> {
        const { id } = await this.createProposalService.call(partyId, request);
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

    @Get(':proposalId')
    async show(
        @Param('proposalId') proposalId: string,
    ): Promise<IApiResponse<DetailProposalResponse>> {
        const proposal = await this.getProposalService.getById(proposalId);
        return {
            message: 'Success get proposal detail',
            data: await DetailProposalResponse.mapFromProposalModel(proposal),
        };
    }

    @Post(':proposalId/approve')
    async approve(
        @Param('proposalId') proposalId: string,
        @Body() request: UpdateProposalStatusRequest,
    ): Promise<IApiResponse<null>> {
        await this.approveProposalService.approve(proposalId, request);
        return {
            message: 'Success approve proposal',
            data: null,
        };
    }

    @Put(':proposalId/approve')
    async updateApprovedProposal(
        @Param('proposalId') proposalId: string,
        @Body() request: UpdateProposalTransactionRequest,
    ): Promise<IApiResponse<null>> {
        await this.updateApprovedProposalService.update(proposalId, request);
        return {
            message: 'Success update approved proposal transaction hash',
            data: null,
        };
    }

    @Post(':proposalId/reject')
    async reject(
        @Param('proposalId') proposalId: string,
        @Body() request: UpdateProposalStatusRequest,
    ): Promise<IApiResponse<null>> {
        await this.rejectProposalService.reject(proposalId, request);
        return { message: 'Success reject proposal', data: null };
    }
}
