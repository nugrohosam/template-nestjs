import BN from 'bn.js';
import {
    Inject,
    Injectable,
    UnprocessableEntityException,
} from '@nestjs/common';
import { Transaction } from 'sequelize/types';
import { localDatabase } from 'src/infrastructure/database/database.provider';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { GetPartyService } from './get-party.service';
import { GetPartyMemberService } from './members/get-party-member.service';

@Injectable()
export class PartyCalculationService {
    constructor(
        private readonly getPartyService: GetPartyService,
        @Inject(GetUserService) private readonly getUserService: GetUserService,
        private readonly getPartyMemberService: GetPartyMemberService,
    ) {}

    validateDepositAmount(amount: BN, party: PartyModel): void {
        if (amount.gt(party.maxDeposit) || amount.lt(party.minDeposit))
            throw new UnprocessableEntityException(
                `Deposit amount must be between ${party.minDeposit} and ${party.maxDeposit}`,
            );
    }

    async updatePartyTotalFund(
        party: PartyModel,
        amount: BN,
        t?: Transaction,
    ): Promise<PartyModel> {
        party.totalFund = party.totalFund.add(amount);
        return await party.save({ transaction: t });
    }

    async updatePartyMemberTotalFund(
        partyMember: PartyMemberModel,
        amount: BN,
        t?: Transaction,
    ): Promise<PartyMemberModel> {
        partyMember.totalFund = partyMember.totalFund.add(amount);
        return await partyMember.save({ transaction: t });
    }

    async deposit(
        partyAddress: string,
        memberAddress: string,
        amount: BN,
        t?: Transaction,
    ): Promise<void> {
        // begin db transaction, and receive passed transaction if any to used passed transaction instead
        const dbTransaction: Transaction = await localDatabase.transaction({
            transaction: t,
        });

        const party = await this.getPartyService.getByAddress(partyAddress);
        const member = await this.getUserService.getUserByAddress(
            memberAddress,
        );
        const partyMember = await this.getPartyMemberService.getByMemberParty(
            member.id,
            party.id,
        );

        this.validateDepositAmount(amount, party);

        try {
            await this.updatePartyTotalFund(party, amount, dbTransaction);
            await this.updatePartyMemberTotalFund(
                partyMember,
                amount,
                dbTransaction,
            );
            dbTransaction.commit();
        } catch (err) {
            dbTransaction.rollback();
            throw err;
        }
    }

    async withdraw(
        partyAddress: string,
        memberAddress: string,
        amount: BN,
        t?: Transaction,
    ): Promise<void> {
        const dbTransaction: Transaction = await localDatabase.transaction({
            transaction: t,
        });

        const party = await this.getPartyService.getByAddress(partyAddress);
        const member = await this.getUserService.getUserByAddress(
            memberAddress,
        );
        const partyMember = await this.getPartyMemberService.getByMemberParty(
            member.id,
            party.id,
        );

        const withdrawAmount = amount.muln(-1);
        try {
            await this.updatePartyTotalFund(
                party,
                withdrawAmount,
                dbTransaction,
            );
            await this.updatePartyMemberTotalFund(
                partyMember,
                withdrawAmount,
                dbTransaction,
            );
            dbTransaction.commit();
        } catch (err) {
            dbTransaction.rollback();
            throw err;
        }
    }
}
