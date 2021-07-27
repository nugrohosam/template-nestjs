import {
    Inject,
    Injectable,
    UnprocessableEntityException,
} from '@nestjs/common';
import { Transaction } from 'sequelize/types';
import { ProposalStatusEnum } from 'src/common/enums/party.enum';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { localDatabase } from 'src/infrastructure/database/database.provider';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { ProposalDistributionModel } from 'src/models/proposal-distribution.model';
import { Proposal } from 'src/models/proposal.model';
import { TransactionModel } from 'src/models/transaction.model';
import { UpdateProposalStatusRequest } from '../../requests/proposal/update-proposal-status.request';
import { GetProposalService } from './get-proposal.service';

@Injectable()
export class ApproveProposalService {
    constructor(
        @Inject(GetProposalService)
        private readonly getProposalService: GetProposalService,
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
    ) {}

    // TODO: need to optimize this
    private async processCalculation(
        party: PartyModel,
        proposal: Proposal,
        { signature }: UpdateProposalStatusRequest,
        t: Transaction,
    ): Promise<void> {
        const members = await party.$get('partyMembers');

        const partyDeposit = await PartyMemberModel.sum('totalDeposit', {
            where: { partyId: party.id },
        });

        for (const member of members) {
            const weight = Number(member.totalDeposit) / partyDeposit;
            const amount = Number(proposal.amount) * weight;

            const distribution = await ProposalDistributionModel.create(
                {
                    proposalId: proposal.id,
                    memberId: member.id,
                    weight: BigInt(Math.floor(weight * 10 ** 2)),
                    amount: BigInt(Math.floor(amount)),
                },
                { transaction: t },
            );

            member.totalFund =
                BigInt(member.totalFund) - BigInt(distribution.amount);
            await member.save({ transaction: t });

            const user = await member.$get('member');
            const transaction = await TransactionModel.create(
                {
                    addressFrom: user.address,
                    addressTo: proposal.contractAddress,
                    amount: BigInt(Number(distribution.amount) * -1),
                    type: TransactionTypeEnum.Distribution,
                    description: `Distribution of proposal "${proposal.title}"`,
                    currencyId: 1,
                    signature,
                },
                { transaction: t },
            );

            party.totalFund += transaction.amount;
            await party.save({ transaction: t });
        }
    }

    async approve(
        proposalId: string,
        { signature }: UpdateProposalStatusRequest,
    ): Promise<Proposal> {
        const proposal = await this.getProposalService.getById(proposalId);
        const party = await proposal.$get('party');
        const owner = await party.$get('owner');

        if (proposal.status !== ProposalStatusEnum.Pending)
            throw new UnprocessableEntityException(
                'Proposal already processed.',
            );

        // TODO: need to discuss who exactly approve the proposal based on party type
        await this.web3Service.validateSignature(
            signature,
            owner.address,
            'approve',
        );

        // validate party balance with proposal amount
        if (party.totalFund < proposal.amount)
            throw new UnprocessableEntityException(
                'Party has insuficient balance.',
            );

        const dbTransaction = await localDatabase.transaction();

        try {
            proposal.approvedAt = new Date();
            await proposal.save({ transaction: dbTransaction });

            await this.processCalculation(
                party,
                proposal,
                { signature },
                dbTransaction,
            );

            await dbTransaction.commit();
            return proposal;
        } catch (err) {
            await dbTransaction.rollback();
            throw err;
        }
    }
}
