import { Inject } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyModel } from 'src/models/party.model';
import { Proposal } from 'src/models/proposal.model';
import { UpdateProposalStatusRequest } from '../../requests/proposal/update-proposal-status.request';
import { GetProposalService } from './get-proposal.service';

export class RejectProposalService {
    constructor(
        @Inject(GetProposalService)
        private readonly getProposalService: GetProposalService,
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
    ) {}

    generateSignatureMessage(party: PartyModel, proposal: Proposal): string {
        return `I want to reject a proposal in ${party.name} with title ${proposal.title}`;
    }

    async reject(
        proposalId: string,
        { signature }: UpdateProposalStatusRequest,
    ): Promise<Proposal> {
        const proposal = await this.getProposalService.getById(proposalId);
        const party = await proposal.$get('party');
        const owner = await party.$get('owner');
        const message = this.generateSignatureMessage(party, proposal);

        // TODO: need to removed after testing
        console.log('message[reject-proposal]: ' + message);
        await this.web3Service.validateSignature(
            signature,
            owner.address,
            message,
        );

        proposal.rejectedAt = new Date();
        return proposal.save();
    }
}
