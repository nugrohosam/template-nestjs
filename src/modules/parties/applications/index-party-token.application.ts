import { Injectable } from '@nestjs/common';
import { IndexApplication } from 'src/infrastructure/applications/index.application';
import { IPaginateResponse } from 'src/common/interface/index.interface';
import { PartyTokenModel } from 'src/models/party-token.model';
import { IndexRequest } from 'src/common/request/index.request';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class IndexPartyTokenApplication extends IndexApplication {
    constructor(
        @InjectRepository(PartyTokenModel)
        private readonly partyTokenRepository: Repository<PartyTokenModel>,
    ) {
        super();
    }

    async fetch(
        partyId: string,
        request: IndexRequest,
    ): Promise<IPaginateResponse<PartyTokenModel>> {
        const [data, count] = await this.partyTokenRepository
            .createQueryBuilder('partyToken')
            .where('party_id = :partyId', { partyId })
            .orderBy('partyToken.createdAt', 'DESC')
            .take(request.perPage ?? this.DefaultPerPage)
            .skip(this.countOffset(request))
            .getManyAndCount();

        return {
            data,
            meta: this.mapMeta(count, request),
        };
    }
}
