import { Inject, UnauthorizedException } from '@nestjs/common';
import {
    OnchainSeriesApplication,
    PrepareOnchainReturn,
} from 'src/infrastructure/applications/onchain.application';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyModel } from 'src/models/party.model';
import { Proposal } from 'src/models/proposal.model';
import { UserModel } from 'src/models/user.model';
import { CreateProposalRequest } from '../requests/proposal/create-proposal.request';
import { UpdateProposalTransactionRequest } from '../requests/proposal/update-proposal-transaction.request';
import { ProposalService } from '../services/proposal/proposal.service';
import { ProposalValidation } from '../services/proposal/proposal.validation';
import { CreateProposalEvents } from 'src/contracts/CreateProposalEvent.json';
import { AbiItem } from 'web3-utils';

export class CreateProposalApplication extends OnchainSeriesApplication {
    constructor(
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
        @Inject(ProposalValidation)
        private readonly proposalValidation: ProposalValidation,
        @Inject(ProposalService)
        private readonly proposalService: ProposalService,
    ) {
        super();
    }

    async prepare(
        user: UserModel,
        party: PartyModel,
        request: CreateProposalRequest,
    ): Promise<PrepareOnchainReturn> {
        await this.web3Service.validateSignature(
            request.signature,
            user.address,
            this.proposalService.generateSignatureMessage(party, request),
        );
        await this.proposalValidation.validateUserIsPartyMember(user, party);
        this.proposalValidation.validateProposalAmount(party, request);

        const proposal = await this.proposalService.store({
            partyId: party.id,
            creatorId: user.id,
            ...request,
        });
        const platformSignature =
            await this.proposalService.generatePlatformSignature(proposal);
        return { data: proposal, platformSignature };
    }

    async commit(
        proposal: Proposal,
        request: UpdateProposalTransactionRequest,
    ): Promise<void> {
        if (request.signature !== proposal.signature)
            throw new UnauthorizedException('Invalid Signature');

        const signer = await proposal.creator;
        await this.web3Service.validateTransaction(
            request.transactionHash,
            signer.address,
            CreateProposalEvents as AbiItem,
            { 0: proposal.id },
        );

        this.proposalService.update(proposal, {
            transactionHash: request.transactionHash,
        });
    }

    async revert(
        proposal: Proposal,
        request: UpdateProposalTransactionRequest,
    ): Promise<void> {
        if (request.signature !== proposal.signature)
            throw new UnauthorizedException('Invalid Signature');

        this.proposalService.update(proposal, {
            transactionHash: null,
        });
    }
}
