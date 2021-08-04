import {
    Inject,
    Injectable,
    UnprocessableEntityException,
} from '@nestjs/common';
import { BN } from 'bn.js';
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

    private readonly WeiPercentage = 10 ** 4;

    private generateSignatureMessage(
        party: PartyModel,
        proposal: Proposal,
    ): string {
        return `I want to approve a proposal in ${party.name} with title ${proposal.title}`;
    }

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
            // to precist the wei number, we format percentage with it's smaller
            // value based of agreement with FE and BE.
            // then we deformat the amount.
            const weight = member.totalDeposit
                .mul(new BN(this.WeiPercentage))
                .div(new BN(partyDeposit));
            const amount = proposal.amount
                .mul(weight)
                .div(new BN(this.WeiPercentage))
                .neg();

            const distribution = await ProposalDistributionModel.create(
                {
                    proposalId: proposal.id,
                    memberId: member.id,
                    weight: weight.muln(10 ** 2),
                    amount: amount,
                },
                { transaction: t },
            );

            member.totalFund = member.totalFund.add(distribution.amount);
            await member.save({ transaction: t });

            const user = await member.$get('member');
            const transaction = await TransactionModel.create(
                {
                    addressFrom: user.address,
                    addressTo: proposal.contractAddress,
                    amount: distribution.amount,
                    type: TransactionTypeEnum.Distribution,
                    description: `Distribution of proposal "${proposal.title}"`,
                    currencyId: 1,
                    signature,
                    transactionHash: '0x0', // TODO: need to clear this!
                    transactionHashStatus: true,
                },
                { transaction: t },
            );

            party.totalFund = party.totalFund.add(transaction.amount);
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

        // validate party must be on pending status
        if (proposal.status !== ProposalStatusEnum.Pending)
            throw new UnprocessableEntityException(
                'Proposal already processed.',
            );

        // validate signature
        const message = this.generateSignatureMessage(party, proposal);
        // TODO: need to removed after testing
        console.log('message[approve-proposal]: ' + message);
        await this.web3Service.validateSignature(
            signature,
            owner.address,
            message,
        );

        // validate party balance with proposal amount
        if (party.totalFund.lt(proposal.amount))
            throw new UnprocessableEntityException(
                'Party has insuficient balance.',
            );

        const dbTransaction = await localDatabase.transaction();

        try {
            proposal.approvedAt = new Date();
            proposal.approveSignature = signature;
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
