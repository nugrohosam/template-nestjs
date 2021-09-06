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

export class ApproveProposalApplication extends OnchainParalelApplication {
    constructor(
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
        @Inject(ProposalService)
        private readonly proposalService: ProposalService,
    ) {
        super();
    }

    async commit(
        proposal: ProposalModel,
        request: ApproveProposalRequest,
    ): Promise<void> {
        const party = await proposal.party;
        const owner = await party.owner;

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
