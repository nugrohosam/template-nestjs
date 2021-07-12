import { PartyMemberModel } from 'src/models/party-member.model';

export class JoinPartyResponse {
    partyMemberId: string;
    platformSignature: string;

    static mapFromPartyMemberModel(
        partyMember: PartyMemberModel,
        platformSignature: string,
    ): JoinPartyResponse {
        return {
            partyMemberId: partyMember.id,
            platformSignature: platformSignature,
        };
    }
}
