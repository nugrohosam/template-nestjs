import { JoinRequestStatusEnum } from 'src/common/enums/party.enum';
import { IJoinRequest } from 'src/entities/join-request.entity';
import { JoinRequestModel } from 'src/models/join-request.model';

export class JoinRequestResponse
    implements Omit<IJoinRequest, 'createdAt' | 'updatedAt' | 'deletedAt'>
{
    id?: string;
    userAddress: string;
    partyId: string;
    status: JoinRequestStatusEnum;
    acceptedAt?: Date;
    rejectedAt?: Date;

    static mapFromJoinRequestModel(
        model: JoinRequestModel,
    ): JoinRequestResponse {
        return {
            id: model.id,
            userAddress: model.userAddress,
            partyId: model.partyId,
            acceptedAt: model.acceptedAt,
            rejectedAt: model.rejectedAt,
            status: model.status,
        };
    }
}
