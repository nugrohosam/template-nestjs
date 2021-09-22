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
import { PartyMemberService } from './members/party-member.service';

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
        private readonly partyMemberService: PartyMemberService,
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

    async updatePartyMembersWeight(party: PartyModel): Promise<void> {
        const partyMembers = await this.partyMemberRepository
            .createQueryBuilder('partyMember')
            .where('party_id = :partyId', { partyId: party.id })
            .getMany();

        await Promise.all(
            partyMembers.map(async (partyMember) =>
                this.partyMemberService.updatePartyMemberWeight(partyMember),
            ),
        );
    }

    @Transactional()
    async deposit(partyMember: PartyMemberModel, amount: BN): Promise<void> {
        const party =
            partyMember.party ??
            (await this.getPartyService.getById(partyMember.partyId));

        const token = await this.tokenService.getDefaultToken();
        await this.updatePartyTotalFund(party, amount);
        await this.updatePartyMemberTotalFund(partyMember, amount);
        await this.updatePartyMembersWeight(party);
        await this.partyService.storeToken(party, token);
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

        const withdrawAmount = amount.neg();
        await this.updatePartyTotalFund(party, withdrawAmount);
        await this.updatePartyMemberTotalFund(partyMember, withdrawAmount);
        await this.updatePartyMembersWeight(party);
    }
}
