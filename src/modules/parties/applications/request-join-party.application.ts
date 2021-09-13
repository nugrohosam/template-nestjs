import { Injectable } from '@nestjs/common';
import { OffchainApplication } from 'src/infrastructure/applications/offchain.application';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { JoinRequestModel } from 'src/models/join-request.model';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { JoinRequestRequest } from '../requests/join-request/join-request.request';
import { JoinRequestService } from '../services/join-request/join-request.service';
import { JoinRequestValidation } from '../services/join-request/join-request.validation';

@Injectable()
export class RequestJoinPartyApplication extends OffchainApplication {
    constructor(
        private readonly web3Service: Web3Service,
        private readonly joinRequestService: JoinRequestService,
        private readonly joinRequestValidation: JoinRequestValidation,
    ) {
        super();
    }

    async call(
        user: UserModel,
        party: PartyModel,
        request: JoinRequestRequest,
    ): Promise<JoinRequestModel> {
        await this.joinRequestValidation.userCanRequestJoinParty(user, party);
        await this.web3Service.validateSignature(
            request.signature,
            user.address,
            this.joinRequestService.generateJoinRequestSignature(party.id),
        );

        return await this.joinRequestService.store(user, party);
    }
}