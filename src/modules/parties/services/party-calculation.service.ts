import BN from 'bn.js';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { GetPartyService } from './get-party.service';
import { GetPartyMemberService } from './members/get-party-member.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartyService } from './party.service';
import { TokenService } from './token/token.service';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { PartyMemberService } from './members/party-member.service';
import { PartyFundService } from './party-fund/party-fund.service';
import { GetTransactionService } from 'src/modules/transactions/services/get-transaction.service';
import { TransactionService } from 'src/modules/transactions/services/transaction.service';

@Injectable()
export class PartyCalculationService {
    constructor(
        @InjectRepository(PartyModel)
        private readonly partyRepository: Repository<PartyModel>,
        @InjectRepository(PartyMemberModel)
        private readonly partyMemberRepository: Repository<PartyMemberModel>,

        private readonly getPartyService: GetPartyService,
        private readonly getUserService: GetUserService,
        private readonly getPartyMemberService: GetPartyMemberService,
        private readonly getTransactionService: GetTransactionService,
        private readonly partyService: PartyService,
        private readonly partyMemberService: PartyMemberService,
        private readonly tokenService: TokenService,
        private readonly partyFundService: PartyFundService,
        private readonly transactionService: TransactionService,
    ) {}

    async updatePartyTotalFund(
        party: PartyModel,
        amount: BN,
    ): Promise<PartyModel> {
        party.totalDeposit = party.totalDeposit.add(amount);
        Logger.debug(
            party.totalDeposit,
            `update partyId total fund: ${party.id} =>`,
        );

        return await this.partyRepository.save(party);
    }

    async updatePartyMemberTotalDeposit(
        partyMember: PartyMemberModel,
        amount: BN,
    ): Promise<PartyMemberModel> {
        partyMember.totalDeposit = partyMember.totalDeposit.add(amount);
        Logger.debug(
            partyMember.totalDeposit,
            `update memberId total deposit: ${partyMember.id} =>`,
        );

        return await this.partyMemberRepository.save(partyMember);
    }

    async updatePartyMembersWeight(party: PartyModel): Promise<void> {
        Logger.debug(`update members partyId ${party.id} weight`);

        const partyMembers = await this.partyMemberRepository
            .createQueryBuilder('partyMember')
            .where('party_id = :partyId', { partyId: party.id })
            .getMany();

        await Promise.all(
            partyMembers.map((partyMember) =>
                this.partyMemberService.updatePartyMemberWeight(partyMember),
            ),
        );
    }

    @Transactional()
    async deposit(
        partyMember: PartyMemberModel,
        amount: BN,
        transactionHash: string,
    ): Promise<void> {
        const transaction = await this.getTransactionService.getByTx(
            transactionHash,
        );

        if (transaction.isDepositeDone) {
            throw new BadRequestException('TransactionHash has been processed');
        }

        const party =
            partyMember.party ??
            (await this.getPartyService.getById(partyMember.partyId));

        const token = await this.tokenService.getDefaultToken();
        Promise.all([
            await this.updatePartyTotalFund(party, amount),
            await this.updatePartyMemberTotalDeposit(partyMember, amount),
            await this.updatePartyMembersWeight(party),
            await this.partyService.storeToken(party, token),
            await this.partyFundService.updatePartyFund(party),
            await this.transactionService.updateDepositeStatus(
                transactionHash,
                true,
            ),
        ]);
    }

    @Transactional()
    async withdraw(
        partyAddress: string,
        memberAddress: string,
        amount: BN,
    ): Promise<void> {
        const party = await this.getPartyService.getByAddress(partyAddress);
        const member = await this.getUserService.getUserByAddress(
            memberAddress,
        );
        const partyMember = await this.getPartyMemberService.getByMemberParty(
            member.id,
            party.id,
        );

        const withdrawAmount = amount.muln(-1);
        await Promise.all([
            await this.updatePartyTotalFund(party, withdrawAmount),
            await this.updatePartyMemberTotalDeposit(
                partyMember,
                withdrawAmount,
            ),
            await this.updatePartyMembersWeight(party),
            await this.partyFundService.updatePartyFund(party),
        ]);
        Logger.debug('LeaveWithdraw line 96');
    }
}
