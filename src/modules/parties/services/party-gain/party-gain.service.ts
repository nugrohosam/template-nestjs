import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { BN } from 'bn.js';
import { PartyGainModel } from 'src/models/party-gain.model';
import { PartyModel } from 'src/models/party.model';
import { Connection, Repository } from 'typeorm';
import { GetTokenPriceService } from '../token/get-token-price.service';

type MapPartyGain = Record<string, PartyGainModel>;
interface IPartyLastGain {
    data?: MapPartyGain;
}
@Injectable()
export class PartyGainService {
    constructor(
        private readonly getTokenPriceService: GetTokenPriceService,
        @InjectRepository(PartyModel)
        private readonly partyRepository: Repository<PartyModel>,
        @InjectRepository(PartyGainModel)
        private readonly partyGainRepository: Repository<PartyGainModel>,
        @InjectConnection()
        private connection: Connection,
    ) {}

    async updatePartiesGain() {
        const listParties = await this.partyRepository
            .createQueryBuilder('party')
            .orderBy('party.createdAt', 'DESC')
            .getMany();
        const partyGainQuery =
            this.partyGainRepository.createQueryBuilder('partyGain');

        const lastFund = partyGainQuery
            .subQuery()
            .select('fund')
            .from(PartyGainModel, 'partyGainLastFund')
            .where('partyGainLastFund.party_id = partyGain.party_id')
            .orderBy('partyGainLastFund.created_at', 'DESC')
            .limit(1)
            .getSql();

        partyGainQuery.addSelect(
            `COALESCE(${lastFund},0)`,
            'partyGain_lastFund',
        );
        const listPartyGain = await partyGainQuery.getMany();

        const partyLastGain: IPartyLastGain = { data: undefined };
        listPartyGain.forEach((item) => {
            if (!partyLastGain.data) {
                partyLastGain.data = {};
            }
            partyLastGain.data[item.id] = item;
        });
        listParties.forEach(async (item) => {
            const partyTotalValue =
                await this.getTokenPriceService.getPartyTokenValue(item);

            // get party last gain
            const partyGain = partyLastGain.data?.[item.id as string];
            const lastFund = partyGain?.lastFund ?? new BN(0);
            const diff = new BN(partyTotalValue * 10 ** 6).sub(lastFund);
            const gain = lastFund.eqn(0) ? 1 : diff.div(lastFund);
            const swapTransaction = this.partyGainRepository.create({
                partyId: item.id,
                fund: partyTotalValue,
                gain,
            });
            this.partyGainRepository.save(swapTransaction);
        });
    }
}
