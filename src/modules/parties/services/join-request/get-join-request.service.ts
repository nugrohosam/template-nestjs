import { Injectable, NotFoundException } from '@nestjs/common';
import { JoinRequestModel } from 'src/models/join-request.model';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';

@Injectable()
export class GetJoinRequestService {
    async getById(id: string): Promise<JoinRequestModel> {
        const joinRequest = await JoinRequestModel.findOne({
            include: [
                {
                    model: PartyModel,
                    as: 'party',
                    required: true,
                    include: [
                        { model: UserModel, as: 'owner', required: true },
                    ],
                },
                { model: UserModel, as: 'user', required: true },
            ],
            where: { id },
        });

        if (!joinRequest)
            throw new NotFoundException('Join request not found.');

        return joinRequest;
    }
}
