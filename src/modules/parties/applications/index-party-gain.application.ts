import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IndexApplication } from 'src/infrastructure/applications/index.application';
import { PartyGainModel } from 'src/models/party-gain.model';
import { Repository } from 'typeorm';

@Injectable()
export class IndexPartyGainApplication extends IndexApplication {
    constructor(
        @InjectRepository(PartyGainModel)
        private readonly repository: Repository<PartyGainModel>,
    ) {
        super();
    }
    async fetch(partyId: string): Promise<any> {
        const data = await this.repository.query(
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
