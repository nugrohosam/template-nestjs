import { Inject } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
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

    async reject(
        proposalId: string,
        { signature }: UpdateProposalStatusRequest,
    ): Promise<Proposal> {
        const proposal = await this.getProposalService.getById(proposalId);
        const party = await proposal.$get('party');
        const owner = await party.$get('owner');

        // TODO: need to discuss who exactly will reject the proposal based on party type
        await this.web3Service.validateSignature(
            signature,
            owner.address,
            'reject',
        );

        proposal.rejectedAt = new Date();
        return proposal.save();
    }
}
