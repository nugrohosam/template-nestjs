import { PartyMemberModel } from 'src/models/party-member.model';
import { ProfileResponse } from 'src/modules/users/responses/profile.response';

export class MemberDetailRespose {
    id: string;
    user: ProfileResponse;
    status: string;
    initialFund: string;
    totalDeposit: string;
    totalFund: string;
    weight: string;
    createdAt: Date;
    updatedAt: Date;

    static mapFromPartyMemberModel(
        partyMember: PartyMemberModel,
    ): MemberDetailRespose {
        return {
            id: partyMember.id,
            user: partyMember.member
                ? ProfileResponse.mapFromUserModel(partyMember.member)
                : null,
            status: partyMember.status,
            initialFund: partyMember.initialFund.toString(),
            totalDeposit: partyMember.totalDeposit.toString(),
            totalFund: partyMember.totalFund.toString(),
            weight: partyMember.weight.toString(),
            createdAt: partyMember.createdAt,
            updatedAt: partyMember.updatedAt,
        };
    }
}
