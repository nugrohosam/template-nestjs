import {
    Inject,
    Injectable,
    UnprocessableEntityException,
} from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { JoinRequestModel } from 'src/models/join-request.model';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { JoinRequestRequest } from '../../requests/join-request/join-request.request';
import { GetPartyService } from '../get-party.service';
import { GetJoinRequestService } from './get-join-request.service';

@Injectable()
export class RequestJoinService {
    constructor(
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
        @Inject(GetJoinRequestService)
        private readonly getJoinRequestService: GetJoinRequestService,
        @Inject(GetUserService)
        private readonly getUserService: GetUserService,
    ) {}

    /**
     * validateUserAddress.
     * user must not registered as party member,
     * user can only make one join request
     */
    private async validateUserAddress(
        userAddress: string,
        partyId: string,
    ): Promise<void> {
        const memberCount = await PartyMemberModel.count({
            where: { partyId },
            include: [
                {
                    model: UserModel,
                    as: 'member',
                    where: { address: userAddress },
                    required: true,
                },
            ],
        });
        if (memberCount > 0)
            throw new UnprocessableEntityException(
                'User already a member of party.',
            );

        const joinRequestCount = await JoinRequestModel.count({
            where: { userAddress, partyId },
        });
        if (joinRequestCount > 0)
            throw new UnprocessableEntityException(
                'User address already requested.',
            );
    }

    async storeJoinRequest(
        user: UserModel,
        party: PartyModel,
    ): Promise<JoinRequestModel> {
        return await JoinRequestModel.create({
            userAddress: user.address,
            partyId: party.id,
        });
    }

    async call(
        partyId: string,
        request: JoinRequestRequest,
    ): Promise<JoinRequestModel> {
        const user = await this.getUserService.getUserByAddress(
            request.userAddress,
        );
        const party = await this.getPartyService.getById(partyId);

        await this.validateUserAddress(user.address, party.id);

        const message = `I would like to make join request to this Party.${user.address} ${partyId}`;
        // TODO: need to removed after testing
        console.log('message[request-join]: ' + message);

        await this.web3Service.validateSignature(
            request.signature,
            user.address,
            message,
        );

        const { id } = await this.storeJoinRequest(user, party);
        return await this.getJoinRequestService.getById(id);
    }
}
