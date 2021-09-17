import BN from 'bn.js';
import { Injectable } from '@nestjs/common';
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
import { config } from 'src/config';

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

    getChargeAmount(amount: BN): BN {
        return amount
            .mul(new BN(config.fee.platformFee))
            .div(new BN(config.fee.maxFeePercentage));
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

    async updatePartyMemberWeight(
        partyMember: PartyMemberModel,
    ): Promise<PartyMemberModel> {
        const party = partyMember.party ?? (await partyMember.getParty);

        partyMember.weight = partyMember.totalDeposit
            .muln(10000)
            .div(party.totalDeposit);

        return this.partyMemberRepository.save(partyMember);
    }

    @Transactional()
    async deposit(partyMember: PartyMemberModel, amount: BN): Promise<void> {
        const party =
            partyMember.party ??
            (await this.getPartyService.getById(partyMember.partyId));

        const token = await this.tokenService.getDefaultToken();
        await this.updatePartyTotalFund(party, amount);
        await this.updatePartyMemberTotalFund(partyMember, amount);
        await this.updatePartyMemberWeight(partyMember);
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

        const withdrawAmount = amount.muln(-1);
        await this.updatePartyTotalFund(party, withdrawAmount);
        await this.updatePartyMemberTotalFund(partyMember, withdrawAmount);
    }
}
