import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { BN } from 'bn.js';
import { PartyGainModel } from 'src/models/party-gain.model';
import { PartyModel } from 'src/models/party.model';
import { Connection, Repository } from 'typeorm';
import { GetTokenPriceService } from '../token/get-token-price.service';
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

    // Update Parties Gain, stored at party_gains table
    // Historical Data
    async updatePartiesGain() {
        const listPartiesQuery =
            this.partyRepository.createQueryBuilder('party');

        const lastFund = listPartiesQuery
            .subQuery()
            .select('fund')
            .from(PartyGainModel, 'partyGainLastFund')
            .where('partyGainLastFund.party_id = party.id')
            .orderBy('partyGainLastFund.created_at', 'DESC')
            .limit(1)
            .getSql();

        listPartiesQuery.addSelect(
            `COALESCE(${lastFund},0)`,
            'partyGain_lastFund',
        );
        const listParties = await listPartiesQuery
            .orderBy('party.createdAt', 'DESC')
            .getMany();

        listParties.forEach(async (item) => {
            const partyTotalValue =
                await this.getTokenPriceService.getPartyTokenValue(item);

            // get party last gain
            const lastFund = item?.lastFund ?? new BN(0);
            const diff = new BN(partyTotalValue * 10 ** 6).sub(lastFund);
            let gain = 0;
            if (lastFund.eqn(0) && diff.eqn(0)) {
                gain = 0;
            } else if (lastFund.eqn(0) && diff.gten(0)) {
                gain = 1;
            } else {
                gain =
                    parseInt(diff.toString()) / parseInt(lastFund.toString());
            }
            const swapTransaction = this.partyGainRepository.create({
                partyId: item.id,
                fund: partyTotalValue,
                gain: gain,
            });
            this.partyGainRepository.save(swapTransaction);
        });
    }

    async updatePartyGain(party: PartyModel) {
        const partyGainQuery =
            this.partyGainRepository.createQueryBuilder('partyGain');
        const listPartyGain = await partyGainQuery
            .groupBy('DATE(created_at)')
            .limit(7)
            .getMany();
        let totalGain = 0;
        listPartyGain.forEach((item) => {
            totalGain += item.gain;
        });
        party.gain = {
            per7Days: parseInt(totalGain.toString()),
        };
        this.partyRepository.save(party);
    }
}
