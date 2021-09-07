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
import { IndexRequest } from 'src/common/request/index.request';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { CreateProposalApplication } from '../applications/create-proposal.application';
import { IndexPartyProposalApplication } from '../applications/index-party-proposal.application';
import { CreateProposalRequest } from '../requests/proposal/create-proposal.request';
import {
    RevertApproveProposalRequest,
    ApproveProposalRequest,
    RejectProposalRequest,
} from '../requests/proposal/update-proposal-status.request';
import { UpdateProposalTransactionRequest } from '../requests/proposal/update-proposal-transaction.request';
import { DetailProposalResponse } from '../responses/proposal/detail-proposal.response';
import { IndexProposalResponse } from '../responses/proposal/index-proposal.response';
import { GetPartyService } from '../services/get-party.service';
import { GetProposalService } from '../services/proposal/get-proposal.service';
import { ApproveProposalApplication } from '../applications/approve-proposal-application';
import { RejectProposalApplication } from '../applications/reject-proposal.application';

@Controller('parties/:partyId/proposals')
export class PartyProposalController {
    constructor(
        private readonly indexPartyProposalApplication: IndexPartyProposalApplication,
        private readonly createProposalApplication: CreateProposalApplication,
        private readonly approveProposalApplication: ApproveProposalApplication,
        private readonly rejectProposalApplication: RejectProposalApplication,

        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
        @Inject(GetUserService)
        private readonly getUserService: GetUserService,
        @Inject(GetProposalService)
        private readonly getProposalService: GetProposalService,
    ) {}

    @Post()
    async store(
        @Param('partyId') partyId: string,
        @Body() request: CreateProposalRequest,
    ): Promise<IApiResponse<{ id: string; platformSignature: string }>> {
        const party = await this.getPartyService.getById(partyId);
        const user = await this.getUserService.getUserByAddress(
            request.signerAddress,
        );
        const { data, platformSignature } =
            await this.createProposalApplication.prepare(user, party, request);
        return {
            message: 'Success create proposal',
            data: { id: data.id, platformSignature },
        };
    }

    @Put(':proposalId/transaction-hash')
    async commit(
        @Param('proposalId') proposalId: string,
        @Body() request: UpdateProposalTransactionRequest,
    ): Promise<IApiResponse<{ id: string }>> {
        const proposal = await this.getProposalService.getById(proposalId);

        await this.createProposalApplication.commit(proposal, request);
        return {
            message: 'Success update proposal transaction hash',
            data: { id: proposal.id },
        };
    }

    @Put(':proposalId/transaction-hash/revert')
    async revert(
        @Param('proposalId') proposalId: string,
        @Body() request: UpdateProposalTransactionRequest,
    ): Promise<IApiResponse<null>> {
        const proposal = await this.getProposalService.getById(proposalId);
        await this.createProposalApplication.revert(proposal, request);
        return {
            message: 'Success revert create proposal transaction',
            data: null,
        };
    }

    @Get()
    async index(
        @Param('partyId') partyId: string,
        @Query() query: IndexRequest,
    ): Promise<IApiResponse<IndexProposalResponse[]>> {
        const party = await this.getPartyService.getById(partyId);
        const { data, meta } = await this.indexPartyProposalApplication.fetch(
            party,
            query,
        );

        const response = data.map((datum) => {
            return IndexProposalResponse.mapFromProposalModel(datum);
        });

        return {
            message: 'Success fetch proposal',
            data: response,
            meta,
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
        @Body() request: ApproveProposalRequest,
    ): Promise<IApiResponse<null>> {
        const proposal = await this.getProposalService.getById(proposalId);
        await this.approveProposalApplication.commit(proposal, request);
        return {
            message: 'Success approve proposal',
            data: null,
        };
    }

    @Put(':proposalId/approve/revert')
    async revertApprove(
        @Param('proposalId') proposalId: string,
        @Body() request: RevertApproveProposalRequest,
    ): Promise<IApiResponse<null>> {
        const proposal = await this.getProposalService.getById(proposalId);
        await this.approveProposalApplication.revert(proposal, request);
        return {
            message: 'Success revert approve proposal transaction',
            data: null,
        };
    }

    @Post(':proposalId/reject')
    async reject(
        @Param('proposalId') proposalId: string,
        @Body() request: RejectProposalRequest,
    ): Promise<IApiResponse<null>> {
        const proposal = await this.getProposalService.getById(proposalId);
        await this.rejectProposalApplication.call(proposal, request);
        return { message: 'Success reject proposal', data: null };
    }
}
