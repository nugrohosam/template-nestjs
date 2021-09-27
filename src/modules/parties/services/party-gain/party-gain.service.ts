import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PartyGainModel } from 'src/models/party-gain.model';
import { PartyModel } from 'src/models/party.model';
import { Repository } from 'typeorm';
import { GetTokenPriceService } from '../token/get-token-price.service';

@Injectable()
export class PartyGainService {
    constructor(
        private readonly getTokenPriceService: GetTokenPriceService,
        @InjectRepository(PartyModel)
        private readonly partyRepository: Repository<PartyModel>,
        @InjectRepository(PartyGainModel)
        private readonly partyGainRepository: Repository<PartyGainModel>,
    ) {}

    async updatePartiesGain() {
        const listParties = await this.partyRepository
            .createQueryBuilder('party')
            .getMany();
        listParties.forEach(async (item) => {
            const partyTotalValue =
                await this.getTokenPriceService.getPartyTokenValue(item);
            const gain = 0; // select previous party gain
            const swapTransaction = this.partyGainRepository.create({
                partyId: item.id,
                fund: partyTotalValue,
                gain,
            });
            this.partyGainRepository.save(swapTransaction);
        });
    }
}
