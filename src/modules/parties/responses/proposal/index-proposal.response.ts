import BN from 'bn.js';
import { ProposalStatusEnum } from 'src/common/enums/party.enum';
import { Proposal } from 'src/models/proposal.model';
import { MemberResponse } from 'src/modules/users/responses/member.response';
import { IndexPartyResponse } from '../index-party.response';

export class IndexProposalResponse {
    id: string;
    title: string;
    description: string;
    status: ProposalStatusEnum;
    contractAddress: string;
    amount: BN;
    attachmentUrl: string;
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
            status: proposal.status,
            contractAddress: proposal.contractAddress,
            amount: proposal.amount,
            attachmentUrl: proposal.attachmentUrl,
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
