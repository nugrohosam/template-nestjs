import { Inject } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { JoinRequestModel } from 'src/models/join-request.model';
import { UpdateStatusJoinRequestRequest } from '../../requests/join-request/update-status-join-request.request';
import { GetJoinRequestService } from './get-join-request.service';

export class UpdateStatusJoinRequestService {
    constructor(
        @Inject(GetJoinRequestService)
        private readonly getJoinRequestService: GetJoinRequestService,
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
    ) {}

    async call(
        joinRequestId: string,
        request: UpdateStatusJoinRequestRequest,
    ): Promise<JoinRequestModel> {
        const joinRequest = await this.getJoinRequestService.getById(
            joinRequestId,
        );
        const message = request.accept
            ? `I want to accept join request with id ${joinRequestId}`
            : `I want to reject join request with id ${joinRequestId}`;

        // TODO: need to removed after testing
        console.log('message[update-status-join-request]: ' + message);
        await this.web3Service.validateSignature(
            request.signature,
            joinRequest.party.owner.address,
            message,
        );

        if (request.accept) {
            joinRequest.acceptedAt = new Date();
        } else {
            joinRequest.rejectedAt = new Date();
        }
        joinRequest.processedBy = joinRequest.party.owner.address;

        return await joinRequest.save();
    }
}
