import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { TransferRequest } from 'src/modules/transactions/requests/transfer.request';
import { TransferService } from 'src/modules/transactions/services/transfer.service';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { JoinPartyRequest } from '../requests/join-party.request';
import { GetPartyService } from './get-party.service';

export class JoinPartyService {
    constructor(
        private readonly getPartyService: GetPartyService,
        private readonly getUserService: GetUserService,
        private readonly transferService: TransferService,
    ) {}

    async storePartyMember(
        party: PartyModel,
        user: UserModel,
        request: JoinPartyRequest,
    ): Promise<PartyMemberModel> {
        return await PartyMemberModel.create({
            partyId: party.id,
            memberId: user.id,
            initialFund: request.initialDeposit,
            totalFund: request.initialDeposit,
            status: 'active', // TODO: need based on member status enum
            transactionHash: request.transactionHash,
        });
    }

    async join(
        partyId: string,
        request: JoinPartyRequest,
    ): Promise<PartyMemberModel> {
        const party = await this.getPartyService.getPartyById(partyId);
        const user = await this.getUserService.getUserByAddress(
            request.userAddress,
        );

        // TODO: validate join signature with user address
        // TODO: validate transaction hash

        await this.transferService.storeTransaction(
            TransferRequest.mapFromJoinPartyRequest(party, user, request),
        );
        return await this.storePartyMember(party, user, request);
    }
}
