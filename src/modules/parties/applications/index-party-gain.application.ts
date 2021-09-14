import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginateResponse } from 'src/common/interface/index.interface';
import { IndexRequest } from 'src/common/request/index.request';
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
    async fetch(
        partyId: string,
        request: IndexRequest,
    ): Promise<IPaginateResponse<PartyGainModel>> {
        const [data, count] = await this.repository
            .createQueryBuilder('partyGain')
            .where('party_id = :partyId', { partyId })
            .orderBy('date', 'DESC')
            .take(request.perPage ?? this.DefaultPerPage)
            .skip(this.countOffset(request))
            .getManyAndCount();

        return { data, meta: this.mapMeta(count, request) };
    }
}
