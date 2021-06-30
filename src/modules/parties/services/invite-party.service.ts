import { Inject, UnprocessableEntityException } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyInvitationModel } from 'src/models/party-invitation.model';
import { PartyModel } from 'src/models/party.model';
import { InviteUserRequest } from '../requests/invite-user.request';
import { GetPartyService } from './get-party.service';

export class InvitePartyService {
    constructor(
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
        private readonly web3Service: Web3Service,
    ) {}

    generateInvitePartyMessage(userAddress: string, party: PartyModel): string {
        return this.web3Service.soliditySha3([
            { t: 'address', v: userAddress },
            { t: 'string', v: party.name },
            { t: 'string', v: party.id },
        ]);
    }

    async validateUserAddress(
        userAddress: string,
        party: PartyModel,
    ): Promise<void> {
        const members = await party.$get('members', {
            where: { address: userAddress },
        });
        if (members.length > 0)
            throw new UnprocessableEntityException('User already a member');

        const invitations = await party.$get('invitations', {
            where: { userAddress },
        });

        if (invitations.length > 0)
            throw new UnprocessableEntityException(
                'User address already has invitation',
            );
    }

    async storeInvitation(
        party: PartyModel,
        request: InviteUserRequest,
    ): Promise<PartyInvitationModel> {
        return await PartyInvitationModel.create({
            partyId: party.id,
            userAddress: request.userAddress,
        });
    }

    async invite(
        partyId: string,
        request: InviteUserRequest,
    ): Promise<PartyInvitationModel> {
        const party = await this.getPartyService.getPartyById(partyId);
        await this.web3Service.validateSignature(
            request.inviteSignature,
            request.userAddress,
            this.generateInvitePartyMessage(request.userAddress, party),
        );
        await this.validateUserAddress(request.userAddress, party);
        return await this.storeInvitation(party, request);
    }
}
