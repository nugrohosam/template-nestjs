import { Inject, Injectable, Query } from '@nestjs/common';
import {
    PaginationResponse,
    SequelizePaginator,
} from 'sequelize-typescript-paginator';
import { IndexRequest } from 'src/common/request/index.request';
import { PartyModel } from 'src/models/party.model';
import { Proposal } from 'src/models/proposal.model';
import { IndexProposalResponse } from '../../responses/proposal/index-proposal.response';
import { GetPartyService } from '../get-party.service';

@Injectable()
export class IndexProposalService {
    constructor(
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
    ) {}

    async mapProposal(proposals: Proposal[]): Promise<IndexProposalResponse[]> {
        return Promise.all(
            proposals.map(async (proposal) => {
                return IndexProposalResponse.mapFromProposalModel(proposal);
            }),
        );
    }

    async fetch(
        partyId: string,
        @Query() query: IndexRequest,
    ): Promise<PaginationResponse<IndexProposalResponse>> {
        const party = await this.getPartyService.getById(partyId);
        const { data, meta } = await SequelizePaginator.paginate(Proposal, {
            perPage: query.perPage ?? 10,
            page: query.page ?? 1,
            options: {
                where: { partyId: party.id },
                order: [[query.sort ?? 'created_at', query.order ?? 'desc']],
            },
        });

        const response = await this.mapProposal(data);

        return { data: response, meta };
    }
}
