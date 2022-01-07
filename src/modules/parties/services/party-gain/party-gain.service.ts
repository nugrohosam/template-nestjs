import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BN from 'bn.js';
import { PartyGainModel } from 'src/models/party-gain.model';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { Repository } from 'typeorm';
import { PartyFundService } from '../party-fund/party-fund.service';
import { GetTokenPriceService } from '../token/get-token-price.service';
@Injectable()
export class PartyGainService {
    constructor(
        @InjectRepository(PartyModel)
        private readonly partyRepository: Repository<PartyModel>,
        @InjectRepository(PartyGainModel)
        private readonly partyGainRepository: Repository<PartyGainModel>,

        private readonly getTokenPriceService: GetTokenPriceService,
        private readonly partyFundService: PartyFundService,
    ) {}

    // Update Parties Gain, stored at party_gains table
    // Historical Data
    async updatePartiesGain(): Promise<void> {
        const listPartiesQuery =
            this.partyRepository.createQueryBuilder('party');

        const lastFundQuery = listPartiesQuery
            .subQuery()
            .select('fund')
            .from(PartyGainModel, 'partyGainLastFund')
            .where('partyGainLastFund.party_id = party.id')
            .orderBy('partyGainLastFund.created_at', 'DESC')
            .limit(1)
            .getSql();

        listPartiesQuery.addSelect(
            `COALESCE(${lastFundQuery},0)`,
            'party_lastFund',
        );

        const initialFundQuery = listPartiesQuery
            .subQuery()
            .select('pm.initialFund')
            .from(PartyMemberModel, 'pm')
            .where('pm.party_id = party.id')
            .andWhere('pm.member_id = party.creator_id')
            .limit(1)
            .getSql();

        listPartiesQuery.addSelect(
            `COALESCE(${initialFundQuery},0)`,
            'party_initialFund',
        );

        const listParties = await listPartiesQuery
            .where(`${initialFundQuery} > 0`)
            .orderBy('party.createdAt', 'DESC')
            .getMany();

        const marketValue = await this.getTokenPriceService.getAllMarketValue();

        listParties.forEach(async (item) => {
            if (!item.address) return;

            const partyTotalValue =
                await this.getTokenPriceService.getPartyTokenValue(
                    item,
                    marketValue,
                );

            // get party last gain
            const lastFund = this.getPartyLastFund(item);
            const gain = this.calculateGainPercentage(
                new BN(partyTotalValue),
                lastFund,
            );

            const swapTransaction = this.partyGainRepository.create({
                partyId: item.id,
                fund: partyTotalValue,
                gain: gain,
            });

            this.partyRepository
                .save({
                    ...item,
                    totalFund: partyTotalValue,
                })
                .then((updatedParty) => {
                    this.partyFundService.updatePartyMembersFund(updatedParty);
                });

            this.partyGainRepository.save(swapTransaction);
            this.updatePartyGain(item);
        });
    }

    async updatePartyGain(party: PartyModel): Promise<void> {
        const currentGain = await this.partyGainRepository
            .createQueryBuilder('partyGain')
            .where('party_id = :partyId', { partyId: party.id })
            .orderBy('created_at', 'DESC')
            .getOne();
        const lastWeekGain = await this.partyGainRepository
            .createQueryBuilder('partyGain')
            .where('party_id = :partyId', { partyId: party.id })
            .andWhere('date(created_at) = date(now()) + interval -1 week')
            .orderBy('created_at', 'DESC')
            .getOne();
        const lastMonthGain = await this.partyGainRepository
            .createQueryBuilder('partyGain')
            .where('party_id = :partyId', { partyId: party.id })
            .andWhere('date(created_at) = date(now()) + interval -1 month')
            .orderBy('created_at', 'DESC')
            .getOne();
        const lastYearGain = await this.partyGainRepository
            .createQueryBuilder('partyGain')
            .where('party_id = :partyId', { partyId: party.id })
            .andWhere('date(created_at) = date(now()) + interval -1 year')
            .orderBy('created_at', 'DESC')
            .getOne();
        const lastDayGain = await this.partyGainRepository
            .createQueryBuilder('partyGain')
            .where('party_id = :partyId', { partyId: party.id })
            .andWhere('date(created_at) = date(now()) + interval -24 hour')
            .orderBy('created_at', 'DESC')
            .getOne();
        const veryFirstGain = await this.partyGainRepository
            .createQueryBuilder('partyGain')
            .where('party_id = :partyId', { partyId: party.id })
            .orderBy('created_at', 'ASC')
            .getOne();

        party.gain = {
            per24Hours: this.calculateGainPercentage(
                currentGain?.fund ?? new BN(0),
                lastDayGain?.fund ?? new BN(0),
            ),
            per7Days: this.calculateGainPercentage(
                currentGain?.fund ?? new BN(0),
                lastWeekGain?.fund ?? new BN(0),
            ),
            per1Month: this.calculateGainPercentage(
                currentGain?.fund ?? new BN(0),
                lastMonthGain?.fund ?? new BN(0),
            ),
            per1Year: this.calculateGainPercentage(
                currentGain?.fund ?? new BN(0),
                lastYearGain?.fund ?? new BN(0),
            ),
            lifeTime: this.calculateGainPercentage(
                currentGain?.fund ?? new BN(0),
                veryFirstGain?.fund ?? new BN(0),
            ),
        };

        this.partyRepository.save(party);
    }

    private getPartyLastFund(item: PartyModel): BN {
        let lastFund = item.lastFund;
        if (lastFund.isZero()) {
            // get party creator
            lastFund = item.initialFund;
        }

        return lastFund;
    }

    private calculateGainPercentage(currentFund: BN, lastFund: BN): number {
        const currFundNumber = currentFund.toNumber();
        const lastFundNumber = lastFund.toNumber();
        const diff = currFundNumber - lastFundNumber;
        return diff / lastFundNumber;
    }
}
