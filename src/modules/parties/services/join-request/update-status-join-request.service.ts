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

    private generateSignatureMessage(
        joinRequest: JoinRequestModel,
        accept: boolean,
    ): string {
        return this.web3Service.soliditySha3([
            { t: 'string', v: joinRequest.id },
            { t: 'bool', v: accept ? 1 : 0 },
        ]);
    }

    async call(
        joinRequestId: string,
        request: UpdateStatusJoinRequestRequest,
    ): Promise<JoinRequestModel> {
        const joinRequest = await this.getJoinRequestService.getById(
            joinRequestId,
        );
        const message = this.generateSignatureMessage(
            joinRequest,
            request.accept,
        );

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

        return await joinRequest.save();
    }
}
