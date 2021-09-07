import { ProposalStatusEnum } from 'src/common/enums/party.enum';
import { ProposalModel } from 'src/models/proposal.model';
import { MemberResponse } from 'src/modules/users/responses/member.response';
import { IndexPartyResponse } from '../index-party.response';

export class IndexProposalResponse {
    id: string;
    title: string;
    description: string;
    status: ProposalStatusEnum;
    contractAddress: string;
    amount: string;
    attachmentUrl: string;
    createdAt?: Date;
    party: IndexPartyResponse;
    creator: MemberResponse;

    static mapFromProposalModel(
        proposal: ProposalModel,
    ): IndexProposalResponse {
        return {
            id: proposal.id,
            title: proposal.title,
            description: proposal.description,
            status: proposal.status,
            contractAddress: proposal.contractAddress,
            amount: proposal.amount.toString(),
            attachmentUrl: proposal.attachmentUrl,
            createdAt: proposal.createdAt,
            party: proposal.party
                ? IndexPartyResponse.mapFromPartyModel(proposal.party)
                : null,
            creator: proposal.creator
                ? MemberResponse.mapFromUserModel(proposal.creator)
                : null,
        };
    }
}
