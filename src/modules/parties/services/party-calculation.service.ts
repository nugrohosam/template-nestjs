import { Inject, Injectable } from '@nestjs/common';
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

    async deposit(
        partyAddress: string,
        memberAddress: string,
        amount: bigint,
    ): Promise<void> {
        const party = await this.getPartyService.getByAddress(partyAddress);
        party.totalFund += amount;
        await party.save();

        const member = await this.getUserService.getUserByAddress(
            memberAddress,
        );
        const partyMember = await this.getPartyMemberService.getByMemberParty(
            member.id,
            party.id,
        );
        partyMember.totalFund += amount;
        await partyMember.save();
    }
}
