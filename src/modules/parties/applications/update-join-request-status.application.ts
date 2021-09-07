import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OffchainApplication } from 'src/infrastructure/applications/offchain.application';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { JoinRequestModel } from 'src/models/join-request.model';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { UpdateStatusJoinRequestRequest } from '../requests/join-request/update-status-join-request.request';
import { GetPartyService } from '../services/get-party.service';
import { JoinRequestService } from '../services/join-request/join-request.service';

export class UpdateJoinRequestStatusApplication extends OffchainApplication {
    constructor(
        @InjectRepository(JoinRequestModel)
        private readonly repository: Repository<JoinRequestModel>,

        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
        @Inject(JoinRequestService)
        private readonly joinRequestService: JoinRequestService,
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
        @Inject(GetUserService)
        private readonly getUserService: GetUserService,
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

        return await this.repository.save(joinRequest);
    }
}
