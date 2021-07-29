import { Injectable, Query } from '@nestjs/common';
import {
    PaginationResponse,
    SequelizePaginator,
} from 'sequelize-typescript-paginator';
import { IndexRequest } from 'src/common/request/index.request';
import { Proposal } from 'src/models/proposal.model';
import { IndexProposalResponse } from '../../responses/proposal/index-proposal.response';

@Injectable()
export class IndexProposalService {
    async mapProposal(proposals: Proposal[]): Promise<IndexProposalResponse[]> {
        return Promise.all(
            proposals.map(async (proposal) => {
                return IndexProposalResponse.mapFromProposalModel(proposal);
            }),
        );
    }

    async fetch(
        @Query() query: IndexRequest,
    ): Promise<PaginationResponse<IndexProposalResponse>> {
        const { data, meta } = await SequelizePaginator.paginate(Proposal, {
            perPage: query.perPage ?? 10,
            page: query.page ?? 1,
            options: {
                order: [[query.sort ?? 'created_at', query.order ?? 'desc']],
            },
        });

        const response = await this.mapProposal(data);

        return { data: response, meta };
    }
}
