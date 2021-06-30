import { Inject, UnprocessableEntityException } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
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

    async validateUser(user: UserModel, party: PartyModel): Promise<void> {
        const member = await party.$get('members', {
            where: { id: user.id },
        })[0];

        if (member)
            throw new UnprocessableEntityException(
                'User already a member in that party.',
            );
    }

    async validateJoinSignature(
        user: UserModel,
        party: PartyModel,
        request: JoinPartyRequest,
    ): Promise<void> {
        const message = this.generateJoinSignature(
            user,
            party,
            request.initialDeposit,
        );
        const signer = await this.web3Service.recover(
            request.joinSignature,
            message,
        );

        if (signer !== user.address)
            throw new UnprocessableEntityException('Signature not valid.');
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

        await this.validateUser(user, party);
        await this.validateJoinSignature(user, party, request);
        // TODO: validate transaction hash

        const partyMember = await this.storePartyMember(party, user, request);

        await this.transferService.storeTransaction(
            TransferRequest.mapFromJoinPartyRequest(party, user, request),
        );

        return partyMember;
    }

    async generatePlatformSignature(
        partyMember: PartyMemberModel,
    ): Promise<string> {
        const message = this.web3Service.soliditySha3([
            { t: 'address', v: partyMember.party.address },
            { t: 'address', v: partyMember.member.address },
            { t: 'string', v: partyMember.id },
        ]);
        return await this.web3Service.sign(message);
    }
}
