import { Proposal } from 'src/models/proposal.model';
import { MemberResponse } from 'src/modules/users/responses/member.response';
import { IndexPartyResponse } from '../index-party.response';

export class IndexProposalResponse {
    id: string;
    title: string;
    description: string;
    createdAt?: Date;
    party: IndexPartyResponse;
    creator: MemberResponse;

    static async mapFromProposalModel(
        proposal: Proposal,
    ): Promise<IndexProposalResponse> {
        return {
            id: proposal.id,
            title: proposal.title,
            description: proposal.description,
            createdAt: proposal.createdAt,
            party: IndexPartyResponse.mapFromPartyModel(
                await proposal.$get('party'),
            ),
            creator: MemberResponse.mapFromUserModel(
                await proposal.$get('creator'),
            ),
        };
    }
}
