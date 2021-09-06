import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OffchainApplication } from 'src/infrastructure/applications/offchain.application';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { JoinRequestModel } from 'src/models/join-request.model';
import { Repository } from 'typeorm';
import { UpdateStatusJoinRequestRequest } from '../requests/join-request/update-status-join-request.request';
import { JoinRequestService } from '../services/join-request/join-request.service';

export class UpdateJoinRequestStatusApplication extends OffchainApplication {
    constructor(
        @InjectRepository(JoinRequestModel)
        private readonly repository: Repository<JoinRequestModel>,

        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
        @Inject(JoinRequestService)
        private readonly joinRequestService: JoinRequestService,
    ) {
        super();
    }

    async call(
        joinRequest: JoinRequestModel,
        request: UpdateStatusJoinRequestRequest,
    ): Promise<JoinRequestModel> {
        const party = await joinRequest.party;
        const owner = await party.owner;

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
