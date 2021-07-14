import {
    Inject,
    InternalServerErrorException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { localDatabase } from 'src/infrastructure/database/database.provider';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { JoinRequestModel } from 'src/models/join-request.model';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { TransferRequest } from 'src/modules/transactions/requests/transfer.request';
import { TransferService } from 'src/modules/transactions/services/transfer.service';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { JoinPartyRequest } from '../../requests/member/join-party.request';
import { GetPartyService } from '../get-party.service';

export class JoinPartyService {
    constructor(
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
        private readonly getUserService: GetUserService,
        private readonly transferService: TransferService,
        private readonly web3Service: Web3Service,
    ) {}

    generateJoinSignature(
        user: UserModel,
        party: PartyModel,
        deposit: bigint,
    ): string {
        return this.web3Service.soliditySha3([
            { t: 'address', v: user.address },
            { t: 'uint', v: deposit.toString() }, // need to persist the digits
            { t: 'string', v: user.id },
            { t: 'address', v: party.address },
        ]);
    }

    private async checkOwnerHasJoin(party: PartyModel): Promise<void> {
        const member = await PartyMemberModel.findOne({
            where: { partyId: party.id, memberId: party.ownerId },
        });

        if (!member)
            throw new UnprocessableEntityException(
                'Party owner not joined yet.',
            );

        if (!member.depositTransactionId)
            throw new UnprocessableEntityException(
                'Party owner not init deposit yet.',
            );
    }

    private async checkUserIsNotMember(
        user: UserModel,
        party: PartyModel,
    ): Promise<void> {
        const member = await PartyMemberModel.findOne({
            where: {
                partyId: party.id,
                memberId: user.id,
            },
        });

        if (member)
            throw new UnprocessableEntityException(
                'User already a member in that party.',
            );
    }

    private async checkUserRequestAccepted(
        user: UserModel,
        party: PartyModel,
    ): Promise<void> {
        if (user.id === party.ownerId) return;

        const joinRequest = await JoinRequestModel.findOne({
            where: {
                userAddress: user.address,
                partyId: party.id,
            },
        });

        if (!joinRequest)
            throw new UnprocessableEntityException(
                'User must request to join first.',
            );

        if (joinRequest.rejectedAt)
            throw new UnprocessableEntityException('Join request rejected.');

        if (!joinRequest.acceptedAt) {
            throw new UnprocessableEntityException(
                'Join request has not accepted yet.',
            );
        }
    }

    async validateUser(user: UserModel, party: PartyModel): Promise<void> {
        if (party.ownerId !== user.id) {
            await this.checkOwnerHasJoin(party);
        }

        await this.checkUserIsNotMember(user, party);

        if (!party.isPublic) {
            await this.checkUserRequestAccepted(user, party);
        }
    }

    private validateUserInitialDeposit(
        party: PartyModel,
        deposit: bigint,
    ): void {
        if (deposit < party.minDeposit || deposit > party.maxDeposit) {
            throw new UnprocessableEntityException(
                `Deposit must be between ${party.minDeposit} and ${party.maxDeposit}`,
            );
        }
    }

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
            signature: request.joinSignature,
        });
    }

    async join(
        partyId: string,
        request: JoinPartyRequest,
    ): Promise<PartyMemberModel> {
        const party = await this.getPartyService.getById(partyId);
        const user = await this.getUserService.getUserByAddress(
            request.userAddress,
        );

        await this.validateUser(user, party);
        this.validateUserInitialDeposit(party, request.initialDeposit);

        const message = this.generateJoinSignature(
            user,
            party,
            request.initialDeposit,
        );
        // TODO: need to removed after testing
        console.log('message[request-join]: ' + message);
        await this.web3Service.validateSignature(
            request.joinSignature,
            user.address,
            message,
        );

        // TODO: validate transaction hash

        let partyMember: PartyMemberModel;
        const transaction = await localDatabase.transaction();
        try {
            partyMember = await this.storePartyMember(party, user, request);

            const depositTransaction =
                await this.transferService.storeTransaction(
                    TransferRequest.mapFromJoinPartyRequest(
                        party,
                        user,
                        request,
                    ),
                );

            partyMember.depositTransactionId = depositTransaction.id;
            await partyMember.save();

            await transaction.commit();
        } catch (err: any) {
            await transaction.rollback();
            throw new InternalServerErrorException(err);
        }

        return partyMember;
    }

    async generatePlatformSignature(
        partyMember: PartyMemberModel,
    ): Promise<string> {
        const party = await partyMember.$get('party');
        const member = await partyMember.$get('member');

        const message = this.web3Service.soliditySha3([
            { t: 'address', v: member.address },
            { t: 'address', v: party.address },
            { t: 'string', v: partyMember.id },
        ]);
        // TODO: need to removed after testing
        console.log('message[platform-join-party]: ' + message);
        return await this.web3Service.sign(message);
    }
}
