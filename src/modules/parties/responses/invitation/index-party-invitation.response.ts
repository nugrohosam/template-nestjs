import { IPartyInvitation } from 'src/entities/parti-invitation.entity';
import { PartyInvitationModel } from 'src/models/party-invitation.model';

export class IndexPartyInvitationResponse
    implements Omit<IPartyInvitation, 'partyId'>
{
    id: string;
    userAddress: string;
    acceptedAt: Date | null;

    static mapFromPartyInvitationModel(
        model: PartyInvitationModel,
    ): IndexPartyInvitationResponse {
        return {
            id: model.id,
            userAddress: model.userAddress,
            acceptedAt: model.acceptedAt,
        };
    }
}
