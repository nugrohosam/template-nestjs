import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JoinRequestModel } from 'src/models/join-request.model';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { Repository } from 'typeorm';

@Injectable()
export class JoinRequestService {
    constructor(
        @InjectRepository(JoinRequestModel)
        private readonly repository: Repository<JoinRequestModel>,
    ) {}

    generateJoinRequestSignature(partyId: string): string {
        const message = `I want to request permission to join party with id ${partyId}`;
        // TODO: need to removed after testing
        console.log('message[request-join]: ' + message);

        return message;
    }

    generateUpdateStatusSignature(
        isAccepted: boolean,
        joinRequestId: string,
    ): string {
        const message = isAccepted
            ? `I want to accept join request with id ${joinRequestId}`
            : `I want to reject join request with id ${joinRequestId}`;

        // TODO: need to removed after testing
        console.log('message[update-status-join-request]: ' + message);
        return message;
    }

    async storeJoinRequest(
        user: UserModel,
        party: PartyModel,
    ): Promise<JoinRequestModel> {
        const joinRequest = this.repository.create({
            userId: user.id,
            partyId: party.id,
        });
        return await this.repository.save(joinRequest);
    }
}
