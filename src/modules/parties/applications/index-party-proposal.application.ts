import { InjectRepository } from '@nestjs/typeorm';
import { IPaginateResponse } from 'src/common/interface/index.interface';
import { IndexRequest } from 'src/common/request/index.request';
import { IndexApplication } from 'src/infrastructure/applications/index.application';
import { PartyModel } from 'src/models/party.model';
import { ProposalModel } from 'src/models/proposal.model';
import { Repository } from 'typeorm';

export class IndexPartyProposalApplication extends IndexApplication {
    constructor(
        @InjectRepository(ProposalModel)
        private readonly repository: Repository<ProposalModel>,
    ) {
        super();
    }

    async fetch(
        party: PartyModel,
        request: IndexRequest,
    ): Promise<IPaginateResponse<ProposalModel>> {
        const query = this.repository.createQueryBuilder('proposals');
        query.where('party_id = :partyId', { partyId: party.id });

        query.orderBy(
            request.sort ?? 'proposals.created_at',
            request.order ?? 'DESC',
        );
        query.take(request.perPage ?? this.DefaultPerPage);
        query.skip(this.countOffset(request));

        const [data, count] = await query.getManyAndCount();
        return {
            data,
            meta: this.mapMeta(count, request),
        };
    }
}
