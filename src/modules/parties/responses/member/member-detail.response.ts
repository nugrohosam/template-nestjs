import BN from 'bn.js';
import { PartyMemberModel } from 'src/models/party-member.model';
import { ProfileResponse } from 'src/modules/users/responses/profile.response';

export class MemberDetailRespose {
    id: string;
    user: ProfileResponse;
    status: string;
    initialFund: BN;
    totalFund: BN;
    createdAt: Date;
    updatedAt: Date;

    static async mapFromPartyMemberModel(
        partyMember: PartyMemberModel,
    ): Promise<MemberDetailRespose> {
        const user = partyMember.member
            ? partyMember.member
            : await partyMember.$get('member');

        return {
            id: partyMember.id,
            user: ProfileResponse.mapFromUserModel(user),
            status: partyMember.status,
            initialFund: partyMember.initialFund,
            totalFund: partyMember.totalFund,
            createdAt: partyMember.createdAt,
            updatedAt: partyMember.updatedAt,
        };
    }
}
