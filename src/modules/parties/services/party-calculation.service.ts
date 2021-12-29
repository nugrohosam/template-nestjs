import BN from 'bn.js';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { GetPartyService } from './get-party.service';
import { GetPartyMemberService } from './members/get-party-member.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { PartyService } from './party.service';
import { TokenService } from './token/token.service';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { PartyMemberService } from './members/party-member.service';
import { PartyFundService } from './party-fund/party-fund.service';
import { GetTransactionService } from 'src/modules/transactions/services/get-transaction.service';
import { TransactionService } from 'src/modules/transactions/services/transaction.service';
import { config } from 'src/config';
import { addAmount, substractAmount } from './calculation.service';

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

    /**
     *
     * @info add Party total deposit, the calculation using addAmount()
     */
    async addPartyTotalDeposit(
        party: PartyModel,
        amount: BN,
    ): Promise<UpdateResult> {
        const totalDeposite = addAmount(party.totalDeposit, amount);

        Logger.debug(
            totalDeposite,
            `update partyId total fund: ${party.id} =>`,
        );

        return this.partyRepository
            .createQueryBuilder()
            .update(PartyModel)
            .set({
                totalDeposit: totalDeposite,
            })
            .where('id = :id', { id: party.id })
            .execute();
    }

    /**
     *
     * @info substract Party total deposit, the calculation using substractAmount()
     */
    async subtractPartyTotalDeposit(
        party: PartyModel,
        amount: BN,
    ): Promise<UpdateResult> {
        const totalDeposite = substractAmount(party.totalDeposit, amount);
        Logger.debug(
            totalDeposite,
            `update partyId total fund: ${party.id} =>`,
        );

        return this.partyRepository
            .createQueryBuilder()
            .update(PartyModel)
            .set({
                totalDeposit: totalDeposite,
            })
            .where('id = :id', { id: party.id })
            .execute();
    }

    /**
     *
     * @info add PartyMember total deposit, the calculation using addAmount()
     */
    async addPartyMemberTotalDeposit(
        partyMember: PartyMemberModel,
        amount: BN,
    ): Promise<UpdateResult> {
        const totalDeposite = addAmount(partyMember.totalDeposit, amount);
        Logger.debug(
            totalDeposite,
            `update memberId total deposit: ${partyMember.id} =>`,
        );

        return this.partyRepository
            .createQueryBuilder()
            .update(PartyModel)
            .set({
                totalDeposit: totalDeposite,
            })
            .where('party_id = :partyId', { partyId: partyMember.partyId })
            .andWhere('member_id = :id', { memberId: partyMember.memberId })
            .execute();
    }

    /**
     *
     * @info substract PartyMember total deposit, the calculation using substractAmount()
     */
    async substractPartyMemberTotalDeposit(
        partyMember: PartyMemberModel,
        amount: BN,
    ): Promise<UpdateResult> {
        const totalDeposite = substractAmount(partyMember.totalDeposit, amount);

        Logger.debug(
            totalDeposite,
            `update memberId total deposit: ${partyMember.id} =>`,
        );

        return this.partyRepository
            .createQueryBuilder()
            .update(PartyModel)
            .set({
                totalDeposit: totalDeposite,
            })
            .where('party_id = :partyId', { partyId: partyMember.partyId })
            .andWhere('member_id = :id', { memberId: partyMember.memberId })
            .execute();
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

        // must be run sequentially : need to use Promise.all.
        await this.addPartyTotalDeposit(party, amount);
        await this.addPartyMemberTotalDeposit(partyMember, amount);
        await this.updatePartyMembersWeight(party);
        await this.partyService.storeToken(party, token);
        Logger.debug('call updatePartyFund on deposit()');
        await this.partyFundService.updatePartyFund(party);
        await this.transactionService.updateDepositeStatus(
            transactionHash,
            true,
        );
    }

    @Transactional()
    async withdraw(
        partyAddress: string,
        memberAddress: string,
        amount: BN,
        percentage: BN,
    ): Promise<PartyMemberModel> {
        const party = await this.getPartyService.getByAddress(partyAddress);
        const member = await this.getUserService.getUserByAddress(
            memberAddress,
        );
        const partyMember = await this.getPartyMemberService.getByMemberParty(
            member.id,
            party.id,
        );
        let withdrawAmount;
        try {
            withdrawAmount = partyMember.totalDeposit
                .mul(percentage)
                .divn(config.calculation.maxPercentage);
        } catch (error) {
            Logger.error(`ERROR CALCULATION WEIGHT on withdraw()`, error);
            throw error;
        }

        Logger.debug(
            {
                withdrawAmount,
                amount,
                percentage,
                totalDeposit: partyMember.totalDeposit,
            },
            'LOG WITHDRAW',
        );

        // must be run sequentially : no need to use Promise.all.
        await this.subtractPartyTotalDeposit(party, withdrawAmount);
        await this.substractPartyMemberTotalDeposit(
            partyMember,
            withdrawAmount,
        );
        await this.updatePartyMembersWeight(party);
        Logger.debug('call updatePartyFund on withdraw()');
        await this.partyFundService.updatePartyFund(party);
        Logger.debug('LeaveWithdraw line 96');
        return partyMember;
    }
}
