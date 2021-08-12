import { PartyMemberModel } from 'src/models/party-member.model';
import { ProfileResponse } from 'src/modules/users/responses/profile.response';

export class MemberDetailRespose {
    id: string;
    user: ProfileResponse;
    status: string;
    initialFund: string;
    totalDeposit: string;
    totalFund: string;
    weight: number;
    createdAt: Date;
    updatedAt: Date;

    static async mapFromPartyMemberModel(
        partyMember: PartyMemberModel,
    ): Promise<MemberDetailRespose> {
        const user = partyMember.member
            ? partyMember.member
            : await partyMember.$get('member');

        const party = partyMember.party
            ? partyMember.party
            : await partyMember.$get('party');

        const currentWeight =
            partyMember.totalDeposit.toNumber() / party.totalDeposit.toNumber();

        return {
            id: partyMember.id,
            user: ProfileResponse.mapFromUserModel(user),
            status: partyMember.status,
            initialFund: partyMember.initialFund.toString(),
            totalDeposit: partyMember.totalDeposit.toString(),
            totalFund: partyMember.totalFund.toString(),
            weight: currentWeight,
            createdAt: partyMember.createdAt,
            updatedAt: partyMember.updatedAt,
        };
    }
}
