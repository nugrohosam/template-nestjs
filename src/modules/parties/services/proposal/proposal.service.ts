import { Inject, Injectable } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyModel } from 'src/models/party.model';
import { ProposalModel } from 'src/models/proposal.model';
import { CreateProposalRequest } from '../../requests/proposal/create-proposal.request';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IProposal } from 'src/entities/proposal.entity';
import { ApproveProposalRequest } from '../../requests/proposal/update-proposal-status.request';
import { BN } from 'bn.js';
import { ProposalDistributionModel } from 'src/models/proposal-distribution.model';
import { PartyMemberModel } from 'src/models/party-member.model';
import { TransactionService } from 'src/modules/transactions/services/transaction.service';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { PartyService } from '../party.service';
import { PartyMemberService } from '../members/party-member.service';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Injectable()
export class ProposalService {
    private readonly WeiPercentage = 10 ** 4;

    constructor(
        @InjectRepository(ProposalModel)
        private readonly proposalRepository: Repository<ProposalModel>,
        @InjectRepository(ProposalDistributionModel)
        private readonly proposalDistributionRepository: Repository<ProposalDistributionModel>,
        @InjectRepository(PartyMemberModel)
        private readonly partyMemberRepository: Repository<PartyMemberModel>,

        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
        @Inject(TransactionService)
        private readonly transactionService: TransactionService,
        @Inject(PartyService)
        private readonly partyService: PartyService,
        @Inject(PartyMemberService)
        private readonly partyMemberService: PartyMemberService,
    ) {}

    generateSignatureMessage(
        party: PartyModel,
        request: CreateProposalRequest,
    ): string {
        const message = `I want to create a proposal in ${party.name} with title ${request.title}`;
        console.log('message[approve-proposal]: ' + message);
        return message;
    }

    async generatePlatformSignature(proposal: ProposalModel): Promise<string> {
        const party = proposal.party;
        const message = this.web3Service.soliditySha3([
            { t: 'string', v: party.id },
            { t: 'address', v: party.address },
            { t: 'string', v: proposal.id },
        ]);

        console.log('message[create-proposal]: ' + message);
        return this.web3Service.sign(message);
    }

    generateApproveSignature(
        party: PartyModel,
        proposal: ProposalModel,
    ): string {
        const message = `I want to approve a proposal in ${party.name} with title ${proposal.title}`;
        console.log('message[approve-proposal]: ' + message);
        return message;
    }

    genereteRejectSignature(
        party: PartyModel,
        proposal: ProposalModel,
    ): string {
        const message = `I want to reject a proposal in ${party.name} with title ${proposal.title}`;
        console.log('message[reject-proposal]: ' + message);
        return message;
    }

    async store(data: IProposal): Promise<ProposalModel> {
        const proposal = this.proposalRepository.create(data);
        return await this.proposalRepository.save(proposal);
    }

    async update(
        proposal: ProposalModel,
        data: Partial<IProposal>,
    ): Promise<ProposalModel> {
        proposal = Object.assign(proposal, data);
        return this.proposalRepository.save(proposal);
    }

    @Transactional()
    async processCalculation(
        party: PartyModel,
        proposal: ProposalModel,
        { signature, transactionHash }: ApproveProposalRequest,
    ): Promise<void> {
        const members = await this.partyMemberRepository.find({
            where: { partyId: party.id },
        });
        const partyDeposit = party.totalDeposit;

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

            let distribution = this.proposalDistributionRepository.create({
                proposalId: proposal.id,
                memberId: member.id,
                weight: weight.muln(10 ** 2),
                amount: amount,
            });
            distribution = await this.proposalDistributionRepository.save(
                distribution,
            );

            await this.partyMemberService.update(member, {
                totalFund: member.totalFund.add(distribution.amount),
            });

            const user = member.member;
            const transaction = await this.transactionService.store({
                addressFrom: user.address,
                addressTo: proposal.contractAddress,
                amount: distribution.amount,
                type: TransactionTypeEnum.Distribution,
                description: `Distribution of proposal "${proposal.title}"`,
                currencyId: 1,
                signature,
                transactionHash,
                transactionHashStatus: true,
            });

            await this.partyService.update(party, {
                totalFund: party.totalFund.add(transaction.amount),
            });
        }
    }
}
