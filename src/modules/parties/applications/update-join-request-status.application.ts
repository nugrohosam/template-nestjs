import { Injectable } from '@nestjs/common';
import { OffchainApplication } from 'src/infrastructure/applications/offchain.application';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { JoinRequestModel } from 'src/models/join-request.model';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { UpdateStatusJoinRequestRequest } from '../requests/join-request/update-status-join-request.request';
import { GetPartyService } from '../services/get-party.service';
import { JoinRequestService } from '../services/join-request/join-request.service';

@Injectable()
export class UpdateJoinRequestStatusApplication extends OffchainApplication {
    constructor(
        private web3Service: Web3Service,
        private joinRequestService: JoinRequestService,
        private getPartyService: GetPartyService,
        private getUserService: GetUserService,
    ) {
        super();
    }

    @Transactional()
    async call(
        joinRequest: JoinRequestModel,
        request: UpdateStatusJoinRequestRequest,
    ): Promise<JoinRequestModel> {
        const party = await this.getPartyService.getById(joinRequest.partyId);
        const owner = await this.getUserService.getUserById(party.ownerId);

        await this.web3Service.validateSignature(
            request.signature,
            owner.address,
            this.joinRequestService.generateUpdateStatusSignature(
                request.accept,
                joinRequest.id,
            ),
        );

        if (request.accept) {
            await this.joinRequestService.acceptJoinRequest(joinRequest, owner);
        } else {
            await this.joinRequestService.rejectJoinRequest(joinRequest, owner);
        }

        return joinRequest;
    }
}
