import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize/types';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { localDatabase } from 'src/infrastructure/database/database.provider';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
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
    private async initiateProposalDistribution(
        party: PartyModel,
        proposal: Proposal,
        t: Transaction,
    ): Promise<void> {
        const members = await party.$get('partyMembers');

        const partyDeposit = await TransactionModel.sum('amount', {
            where: {
                type: TransactionTypeEnum.Deposit,
                addressTo: party.address,
            },
        });

        for (const member of members) {
            const user = await member.$get('member');
            const memberDeposit = await TransactionModel.sum('amount', {
                where: {
                    type: TransactionTypeEnum.Deposit,
                    addressTo: party.address,
                    addressFrom: user.address,
                },
            });
            const weight = memberDeposit / partyDeposit;
            const amount = Number(proposal.amount) * weight;

            await ProposalDistributionModel.create(
                {
                    proposalId: proposal.id,
                    memberId: member.id,
                    weight: BigInt(Math.floor(weight * 10 ** 2)),
                    amount: BigInt(Math.floor(amount)),
                },
                { transaction: t },
            );
        }
    }

    async approve(
        proposalId: string,
        { signature }: UpdateProposalStatusRequest,
    ): Promise<Proposal> {
        const proposal = await this.getProposalService.getById(proposalId);
        const party = await proposal.$get('party');
        const owner = await party.$get('owner');

        // TODO: need to discuss who exactly approve the proposal based on party type
        await this.web3Service.validateSignature(
            signature,
            owner.address,
            'approve',
        );

        const dbTransaction = await localDatabase.transaction();

        try {
            proposal.approvedAt = new Date();
            await proposal.save();

            await this.initiateProposalDistribution(
                party,
                proposal,
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
