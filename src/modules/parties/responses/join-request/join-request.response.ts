import { JoinRequestStatusEnum } from 'src/common/enums/party.enum';
import { IJoinRequest } from 'src/entities/join-request.entity';
import { JoinRequestModel } from 'src/models/join-request.model';
import { MemberResponse } from 'src/modules/users/responses/member.response';
import { IndexPartyResponse } from '../index-party.response';

export class JoinRequestResponse
    implements
        Omit<
            IJoinRequest,
            'userId' | 'partyId' | 'createdAt' | 'updatedAt' | 'deletedAt'
        >
{
    id?: string;
    user?: MemberResponse;
    party?: IndexPartyResponse;
    status: JoinRequestStatusEnum;
    acceptedAt?: Date;
    rejectedAt?: Date;

    static async mapFromJoinRequestModel(
        model: JoinRequestModel,
    ): Promise<JoinRequestResponse> {
        const user = await model.user;
        const party = await model.party;

        return {
            id: model.id,
            user: {
                id: user.id,
                address: user.address,
                username: user.username,
            },
            party: await IndexPartyResponse.mapFromPartyModel(party),
            acceptedAt: model.acceptedAt,
            rejectedAt: model.rejectedAt,
            status: model.status,
        };
    }
}
