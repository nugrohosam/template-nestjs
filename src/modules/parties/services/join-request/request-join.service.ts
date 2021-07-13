import { Inject, Injectable } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { JoinRequestModel } from 'src/models/join-request.model';
import { PartyModel } from 'src/models/party.model';
import { JoinRequestRequest } from '../../requests/join-request/join-request.request';
import { GetPartyService } from '../get-party.service';

@Injectable()
export class RequestJoinService {
    constructor(
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
    ) {}

    private generateSignatureMessage(
        request: JoinRequestRequest,
        party: PartyModel,
    ): string {
        return this.web3Service.soliditySha3([
            { t: 'address', v: request.userAddress },
            { t: 'string', v: party.id },
        ]);
    }

    async storeJoinRequest(
        request: JoinRequestRequest,
        party: PartyModel,
    ): Promise<JoinRequestModel> {
        return await JoinRequestModel.create({
            userAddress: request.userAddress,
            partyId: party.id,
        });
    }

    async call(
        partyId: string,
        request: JoinRequestRequest,
    ): Promise<JoinRequestModel> {
        const party = await this.getPartyService.getById(partyId);
        const message = this.generateSignatureMessage(request, party);

        // TODO: need to removed after testing
        console.log('message[platform-create-party]: ' + message);
        await this.web3Service.validateSignature(
            request.signature,
            request.userAddress,
            message,
        );

        return await this.storeJoinRequest(request, party);
    }
}
