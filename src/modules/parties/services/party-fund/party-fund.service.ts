import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CurrencyModel } from 'src/models/currency.model';
import { PartyModel } from 'src/models/party.model';
import { Repository } from 'typeorm';
import { GetTokenPriceService } from '../token/get-token-price.service';
@Injectable()
export class PartyFundService {
    constructor(
        @InjectRepository(CurrencyModel)
        private readonly currencyRepository: Repository<CurrencyModel>,
        private readonly getTokenPriceService: GetTokenPriceService,
        @InjectRepository(PartyModel)
        private readonly partyRepository: Repository<PartyModel>,
    ) {}

    async updatePartyFund(party: PartyModel) {
        const marketValue = await this.getTokenPriceService.getAllMarketValue();
        const partyTotalValue =
            await this.getTokenPriceService.getPartyTokenValue(
                party,
                marketValue,
            );
        return await this.partyRepository.save({
            ...party,
            totalFund: partyTotalValue,
        });
    }
}
