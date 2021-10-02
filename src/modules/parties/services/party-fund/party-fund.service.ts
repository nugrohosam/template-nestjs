import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PartyModel } from 'src/models/party.model';
import { Repository } from 'typeorm';
import { GetTokenPriceService } from '../token/get-token-price.service';
@Injectable()
export class PartyFundService {
    constructor(
        private readonly getTokenPriceService: GetTokenPriceService,
        @InjectRepository(PartyModel)
        private readonly partyRepository: Repository<PartyModel>,
    ) {}

    async updatePartyFund(party: PartyModel) {
        const partyTotalValue =
            await this.getTokenPriceService.getPartyTokenValue(party);
        return await this.partyRepository.save({
            ...party,
            totalFund: partyTotalValue,
        });
    }
}
