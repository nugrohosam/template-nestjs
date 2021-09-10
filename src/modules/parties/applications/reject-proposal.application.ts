import { Inject } from '@nestjs/common';
import { OffchainApplication } from 'src/infrastructure/applications/offchain.application';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { ProposalModel } from 'src/models/proposal.model';
import { RejectProposalRequest } from '../requests/proposal/update-proposal-status.request';
import { ProposalService } from '../services/proposal/proposal.service';

export class RejectProposalApplication extends OffchainApplication {
    constructor(
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
        @Inject(ProposalService)
        private readonly proposalService: ProposalService,
    ) {
        super();
    }

    async call(
        proposal: ProposalModel,
        { signature }: RejectProposalRequest,
    ): Promise<void> {
        const party = await proposal.party;
        const owner = await party.owner;
        const message = this.proposalService.genereteRejectSignature(
            party,
            proposal,
        );

        await this.web3Service.validateSignature(
            signature,
            owner.address,
            message,
        );

        this.proposalService.update(proposal, {
            rejectedAt: new Date(),
        });
    }
}
