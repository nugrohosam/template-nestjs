import {
    Inject,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { ProposalStatusEnum } from 'src/common/enums/party.enum';
import { OnchainParalelApplication } from 'src/infrastructure/applications/onchain.application';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { ProposalModel } from 'src/models/proposal.model';
import { ApproveProposalRequest } from '../requests/proposal/update-proposal-status.request';
import { ProposalService } from '../services/proposal/proposal.service';
import { ApproveProposalEvent } from 'src/contracts/ApproveProposalEvent.json';
import { AbiItem } from 'web3-utils';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { GetPartyService } from '../services/get-party.service';
import { GetUserService } from 'src/modules/users/services/get-user.service';

export class ApproveProposalApplication extends OnchainParalelApplication {
    constructor(
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
        @Inject(ProposalService)
        private readonly proposalService: ProposalService,
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
        @Inject(GetUserService)
        private readonly getUserService: GetUserService,
    ) {
        super();
    }

    @Transactional()
    async commit(
        proposal: ProposalModel,
        request: ApproveProposalRequest,
    ): Promise<void> {
        const party = await this.getPartyService.getById(proposal.partyId);
        const owner = await this.getUserService.getUserById(party.ownerId);

        if (proposal.status !== ProposalStatusEnum.Pending)
            throw new UnprocessableEntityException(
                'Proposal already processed.',
            );

        this.web3Service.validateSignature(
            request.signature,
            owner.address,
            this.proposalService.generateApproveSignature(party, proposal),
        );

        const transactionStatus = await this.web3Service.validateTransaction(
            request.transactionHash,
            owner.address,
            ApproveProposalEvent as AbiItem,
            { 0: proposal.id },
        );

        // validate party balance with proposal amount
        if (party.totalFund.lt(proposal.amount))
            throw new UnprocessableEntityException(
                'Party has insuficient balance.',
            );

        proposal = await this.proposalService.update(proposal, {
            approvedAt: new Date(),
            approveSignature: request.signature,
            approveTransactionHash: request.transactionHash,
        });

        if (!transactionStatus) return;

        await this.proposalService.processCalculation(party, proposal, request);
    }

    async revert(
        proposal: ProposalModel,
        { signature }: ApproveProposalRequest,
    ): Promise<void> {
        if (signature !== proposal.approveSignature)
            throw new UnauthorizedException('Invalid Signature');

        await this.proposalService.update(proposal, {
            approvedAt: null,
            approveSignature: null,
            approveTransactionHash: null,
        });
    }
}
