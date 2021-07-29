import {
    Inject,
    Injectable,
    UnprocessableEntityException,
} from '@nestjs/common';
import BN from 'bn.js';
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
import { UserModel } from 'src/models/user.model';
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

    private generateSignatureMessage(
        owner: UserModel,
        proposal: Proposal,
    ): string {
        return this.web3Service.soliditySha3([
            { t: 'address', v: owner.address },
            { t: 'address', v: proposal.contractAddress },
            { t: 'uint256', v: proposal.amount.toString() },
            { t: 'string', v: proposal.id },
        ]);
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
            const weight = member.totalDeposit.divRound(new BN(partyDeposit));
            const amount = proposal.amount.mul(weight);

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
                    amount: distribution.amount.muln(-1),
                    type: TransactionTypeEnum.Distribution,
                    description: `Distribution of proposal "${proposal.title}"`,
                    currencyId: 1,
                    signature,
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
        const message = this.generateSignatureMessage(owner, proposal);
        // TODO: need to removed after testing
        console.log('message[approve-proposal]: ' + message);
        await this.web3Service.validateSignature(
            signature,
            owner.address,
            message,
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
