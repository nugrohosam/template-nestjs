import { Inject, UnprocessableEntityException } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { CreatePartyRequest } from '../requests/create-party.request';
import { config } from 'src/config';

export class CreatePartyService {
    constructor(
        @Inject(Web3Service) private readonly web3Service: Web3Service,
    ) {}

    generateCreatePartySignatureMessage(request: CreatePartyRequest): string {
        return this.web3Service.soliditySha3([
            { t: 'address', v: request.memberAddress },
            { t: 'string', v: request.name },
        ]);
    }

    async validateCreatePartySignature(
        request: CreatePartyRequest,
    ): Promise<string> {
        const message = this.generateCreatePartySignatureMessage(request);

        // TODO: need to removed after testing
        console.log('message[create-party]: ' + message);

        const signer = await this.web3Service.recover(
            request.memberSignature,
            message,
        );

        if (signer !== request.memberAddress)
            throw new UnprocessableEntityException('Signature not valid.');

        return signer;
    }

    async validateCreatorAddress(address: string): Promise<UserModel> {
        const creator = await UserModel.findOne({
            where: { address: address },
        });

        if (!creator)
            throw new UnprocessableEntityException('User not registered.');

        return creator;
    }

    async create(request: CreatePartyRequest): Promise<PartyModel> {
        const creatorAddress = await this.validateCreatePartySignature(request);
        const creator = await this.validateCreatorAddress(creatorAddress);

        const party = await PartyModel.create({
            ...request,
            signature: request.memberSignature,
            creatorId: creator.id,
            ownerId: creator.id,
            totalFund: 0,
            totalMember: 0,
        });

        return party;
    }

    async generatePlatformSignature(
        party: PartyModel,
        creator: UserModel,
    ): Promise<string> {
        const platformAddress = config.platform.address;
        const message = this.web3Service.soliditySha3([
            { t: 'string', v: party.id },
            { t: 'address', v: creator.address },
            { t: 'address', v: platformAddress },
            { t: 'string', v: creator.id },
            { t: 'bool', v: party.isPublic ? 1 : 0 },
        ]);
        // TODO: need to removed after testing
        console.log('message[platform-create-party]: ' + message);
        return await this.web3Service.sign(message);
    }
}
