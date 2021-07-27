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
    amount: bigint;
    currencyId: number;
    transactionHash?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
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
            amount: proposal.amount,
            currencyId: proposal.currencyId,
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
