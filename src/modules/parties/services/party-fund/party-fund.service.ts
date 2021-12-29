import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CurrencyModel } from 'src/models/currency.model';
import { PartyModel } from 'src/models/party.model';
import { Repository } from 'typeorm';
import { GetPartyMemberService } from '../members/get-party-member.service';
import { PartyMemberService } from '../members/party-member.service';
import { GetTokenPriceService } from '../token/get-token-price.service';
@Injectable()
export class PartyFundService {
    constructor(
        @InjectRepository(CurrencyModel)
        private readonly currencyRepository: Repository<CurrencyModel>,
        private readonly getTokenPriceService: GetTokenPriceService,
        @InjectRepository(PartyModel)
        private readonly partyRepository: Repository<PartyModel>,
        private readonly getPartyMemberService: GetPartyMemberService,
        private readonly partyMemberService: PartyMemberService,
    ) {}

    async updatePartyFund(party: PartyModel): Promise<PartyModel> {
        const marketValue = await this.getTokenPriceService.getAllMarketValue();
        const partyTotalValue =
            await this.getTokenPriceService.getPartyTokenValue(
                party,
                marketValue,
            );
        // here we need to check
        party = await this.partyRepository.save({
            ...party,
            totalFund: partyTotalValue,
        });

        await this.updatePartyMembersFund(party);
        return party;
    }

    async updatePartyMembersFund(party: PartyModel): Promise<void> {
        const partyMembers =
            await this.getPartyMemberService.getPartyMembersOfParty(party.id);
        await Promise.all(
            partyMembers.map((partyMember) => {
                this.partyMemberService.updatePartyMemberFund(partyMember);
            }),
        );
    }
}
