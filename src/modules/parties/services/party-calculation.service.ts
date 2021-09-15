import BN from 'bn.js';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { GetPartyService } from './get-party.service';
import { GetPartyMemberService } from './members/get-party-member.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartyService } from './party.service';
import { TokenService } from './token/token.service';
import { GetUserService } from 'src/modules/users/services/get-user.service';

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
        private readonly partyService: PartyService,
        private readonly tokenService: TokenService,
    ) {}

    validateDepositAmount(amount: BN, party: PartyModel): void {
        if (amount.gt(party.maxDeposit) || amount.lt(party.minDeposit))
            throw new UnprocessableEntityException(
                `Deposit amount must be between ${party.minDeposit} and ${party.maxDeposit}`,
            );
    }

    validateWithdrawAmount(amount: BN, partyMember: PartyMemberModel): void {
        if (amount.gt(partyMember.totalFund))
            throw new UnprocessableEntityException(
                `Withdraw amount must be less then or equal to current total fund in the party`,
            );
    }

    getCutAmount(amount: BN): BN {
        return amount.muln(5).divn(1000);
    }

    async updatePartyTotalFund(
        party: PartyModel,
        amount: BN,
    ): Promise<PartyModel> {
        party.totalFund = party.totalFund.add(amount);
        party.totalDeposit = party.totalDeposit.add(amount);
        return await this.partyRepository.save(party);
    }

    async updatePartyMemberTotalFund(
        partyMember: PartyMemberModel,
        amount: BN,
    ): Promise<PartyMemberModel> {
        partyMember.totalFund = partyMember.totalFund.add(amount);
        partyMember.totalDeposit = partyMember.totalDeposit.add(amount);
        return await this.partyMemberRepository.save(partyMember);
    }

    async deposit(partyMember: PartyMemberModel, amount: BN): Promise<void> {
        const party =
            partyMember.party ??
            (await this.getPartyService.getById(partyMember.partyId));

        this.validateDepositAmount(amount, party);

        const token = await this.tokenService.getDefaultToken();

        await this.updatePartyTotalFund(party, amount);
        await this.updatePartyMemberTotalFund(partyMember, amount);
        await this.partyService.storeToken(party, token, amount);
    }

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

        this.validateWithdrawAmount(amount, partyMember);

        const withdrawAmount = amount.muln(-1);
        await this.updatePartyTotalFund(party, withdrawAmount);
        await this.updatePartyMemberTotalFund(partyMember, withdrawAmount);
    }
}
