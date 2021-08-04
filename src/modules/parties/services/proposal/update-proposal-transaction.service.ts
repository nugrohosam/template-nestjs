import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { Proposal } from 'src/models/proposal.model';
import { UpdateProposalTransactionRequest } from '../../requests/proposal/update-proposal-transaction.request';
import { createProposalEvent } from 'src/contracts/CreateProposalEvent.json';
import { AbiItem } from 'web3-utils';
import { GetProposalService } from './get-proposal.service';

@Injectable()
export class UpdateProposalTransactionService {
    constructor(
        @Inject(GetProposalService)
        private readonly getProposalService: GetProposalService,
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
    ) {}

    validateSignature(
        proposal: Proposal,
        request: UpdateProposalTransactionRequest,
    ): void {
        if (proposal.signature !== request.signature)
            throw new UnauthorizedException('Signature not valid.');
    }

    async update(
        proposalId: string,
        request: UpdateProposalTransactionRequest,
    ): Promise<Proposal> {
        const proposal = await this.getProposalService.getById(proposalId);

        this.validateSignature(proposal, request);

        const signer = await proposal.$get('creator');
        await this.web3Service.validateTransaction(
            request.transactionHash,
            signer.address,
            createProposalEvent as AbiItem,
            { 0: proposal.id },
        );

        proposal.transactionHash = request.transactionHash;
        return await proposal.save();
    }
}
