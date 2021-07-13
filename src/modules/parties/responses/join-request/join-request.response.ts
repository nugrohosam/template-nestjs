import { JoinRequestStatusEnum } from 'src/common/enums/party.enum';
import { IJoinRequest } from 'src/entities/join-request.entity';
import { JoinRequestModel } from 'src/models/join-request.model';
import { IndexPartyResponse } from '../index-party.response';

export class JoinRequestResponse
    implements
        Omit<IJoinRequest, 'partyId' | 'createdAt' | 'updatedAt' | 'deletedAt'>
{
    id?: string;
    userAddress: string;
    party?: IndexPartyResponse;
    status: JoinRequestStatusEnum;
    acceptedAt?: Date;
    rejectedAt?: Date;

    static mapFromJoinRequestModel(
        model: JoinRequestModel,
    ): JoinRequestResponse {
        return {
            id: model.id,
            userAddress: model.userAddress,
            party: !model.party
                ? undefined
                : IndexPartyResponse.mapFromPartyModel(model.party),
            acceptedAt: model.acceptedAt,
            rejectedAt: model.rejectedAt,
            status: model.status,
        };
    }
}
