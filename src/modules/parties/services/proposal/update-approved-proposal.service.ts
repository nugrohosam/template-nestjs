import {
    Inject,
    Injectable,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { ProposalStatusEnum } from 'src/common/enums/party.enum';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { Proposal } from 'src/models/proposal.model';
import { UpdateProposalTransactionRequest } from '../../requests/proposal/update-proposal-transaction.request';
import { GetProposalService } from './get-proposal.service';
import { approveProposalEvent } from 'src/contracts/ApproveProposalEvent.json';
import { AbiItem } from 'web3-utils';
import { localDatabase } from 'src/infrastructure/database/database.provider';

@Injectable()
export class UpdateApprovedProposalService {
    constructor(
        @Inject(GetProposalService)
        private readonly getProposalService: GetProposalService,
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
    ) {}

    async update(
        proposalId: string,
        request: UpdateProposalTransactionRequest,
    ): Promise<Proposal> {
        const proposal = await this.getProposalService.getById(proposalId);
        const party = await proposal.$get('party');
        const owner = await party.$get('owner');

        if (proposal.status !== ProposalStatusEnum.Approved)
            throw new UnprocessableEntityException(
                'Proposal not approved yet.',
            );

        if (proposal.approveSignature !== request.signature)
            throw new UnauthorizedException('Signature not valid.');

        await this.web3Service.validateTransaction(
            request.transactionHash,
            owner.address,
            approveProposalEvent as AbiItem,
            0,
            proposal.id,
        );

        const dbTransaction = await localDatabase.transaction();

        try {
            const distributions = await proposal.$get('distributions');
            for (const distribution of distributions) {
                distribution.transactionHash = request.transactionHash;
                await distribution.save({ transaction: dbTransaction });
            }

            proposal.approveTransactionHash = request.transactionHash;
            await proposal.save();

            await dbTransaction.commit();
            return proposal;
        } catch (err) {
            await dbTransaction.rollback();
            throw err;
        }
    }
}
