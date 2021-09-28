import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PartyGainModel } from 'src/models/party-gain.model';
import { Repository } from 'typeorm';

export interface IPartyGainCandleStickData {
    partyId: string;
    dateTime: string;
    maxFund: string;
    minFund: string;
    openFund: string;
    lastFund: string;
}
@Injectable()
export class IndexPartyGainApplication {
    constructor(
        @InjectRepository(PartyGainModel)
        private readonly repository: Repository<PartyGainModel>,
    ) {}
    async fetch(partyId: string): Promise<IPartyGainCandleStickData[]> {
        const data: IPartyGainCandleStickData[] = await this.repository.query(
            `select pg.party_id partyID,
            DATE(pg.created_at) as dateTime,
            max(fund) maxFund,min(fund) minFund,
            (select pg_open.fund from party_gains pg_open where pg.party_id=pg_open.party_id and DATE(pg.created_at) = DATE(pg_open.created_at) order by created_at ASC limit 1) as openFund,
            (select pg_open.fund from party_gains pg_open where pg.party_id=pg_open.party_id and DATE(pg.created_at) = DATE(pg_open.created_at) order by created_at DESC limit 1) as lastFund
            from party_gains pg where pg.party_id = ? group by pg.party_id,DATE(pg.created_at),openFund,lastFund`,
            [partyId],
        );
        return data;
    }
}
