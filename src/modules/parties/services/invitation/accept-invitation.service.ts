import { Inject, NotFoundException } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyInvitationModel } from 'src/models/party-invitation.model';
import { GetUserService } from 'src/modules/users/services/get-user.service';

export class AcceptInvitationService {
    constructor(
        @Inject(Web3Service) private readonly web3Service: Web3Service,
        @Inject(GetUserService) private readonly getUserService: GetUserService,
    ) {}

    async getPartyInvitation(
        invitationId: string,
    ): Promise<PartyInvitationModel> {
        const invitation = await PartyInvitationModel.findOne({
            where: { id: invitationId },
        });
        if (!invitation) throw new NotFoundException('Invitation not found');
        return invitation;
    }

    generateAcceptSignature(invitation: PartyInvitationModel): string {
        return this.web3Service.soliditySha3([
            { t: 'string', v: invitation.id },
            { t: 'address', v: invitation.userAddress },
            { t: 'string', v: invitation.partyId },
        ]);
    }

    async validateUserAddress(userAddress: string): Promise<void> {
        await this.getUserService.getUserByAddress(userAddress);
    }

    async accept(invitationId: string, signature: string): Promise<void> {
        const invitation = await this.getPartyInvitation(invitationId);
        await this.validateUserAddress(invitation.userAddress);

        const message = this.generateAcceptSignature(invitation);
        // TODO: need to removed after testing
        console.log('message[accept-party-invitation]: ' + message);
        await this.web3Service.validateSignature(
            signature,
            invitation.userAddress,
            message,
        );

        invitation.acceptedAt = new Date();
        await invitation.save();
        return;
    }
}
