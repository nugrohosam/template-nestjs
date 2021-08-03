import { ProposalStatusEnum } from 'src/common/enums/party.enum';
import { IProposal } from 'src/entities/proposal.entity';
import { Proposal } from 'src/models/proposal.model';
import { MemberResponse } from 'src/modules/users/responses/member.response';
import { IndexPartyResponse } from '../index-party.response';

export class DetailProposalResponse
    implements Omit<IProposal, 'partyId' | 'creatorId' | 'signature'>
{
    id?: string;
    title: string;
    description: string;
    contractAddress: string;
    attachmentUrl: string;
    voteStart: Date;
    voteEnd: Date;
    projectStart: Date;
    projectEnd: Date;
    amount: string;
    currencyId: number;
    transactionHash?: string;
    status: ProposalStatusEnum;
    createdAt?: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    party?: IndexPartyResponse;
    creator?: MemberResponse;

    static async mapFromProposalModel(
        proposal: Proposal,
    ): Promise<DetailProposalResponse> {
        return {
            id: proposal.id,
            title: proposal.title,
            description: proposal.description,
            contractAddress: proposal.contractAddress,
            attachmentUrl: proposal.attachmentUrl,
            voteStart: proposal.voteStart,
            voteEnd: proposal.voteEnd,
            projectStart: proposal.projectStart,
            projectEnd: proposal.projectEnd,
            amount: proposal.amount.toString(),
            currencyId: proposal.currencyId,
            status: proposal.status,
            createdAt: proposal.createdAt,
            approvedAt: proposal.approvedAt,
            rejectedAt: proposal.rejectedAt,
            party: await IndexPartyResponse.mapFromPartyModel(
                await proposal.$get('party'),
            ),
            creator: MemberResponse.mapFromUserModel(
                await proposal.$get('creator'),
            ),
        };
    }
}
