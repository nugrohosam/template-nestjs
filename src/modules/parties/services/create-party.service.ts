import { Inject, UnprocessableEntityException } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { CreatePartyRequest } from '../requests/create-party.request';

export class CreatePartyService {
    constructor(
        @Inject(Web3Service) private readonly web3Service: Web3Service,
    ) {}

    generateCreatePartySignatureMessage(): string {
        // todo: Need to fixed by FE and SC
        return 'I would like to create party';
    }

    async validateCreatePartySignature(
        request: CreatePartyRequest,
    ): Promise<string> {
        const message = this.generateCreatePartySignatureMessage();
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
            creatorId: creator.id,
            ownerId: creator.id,
            totalFund: 0,
            totalMember: 0,
        });

        return party;
    }

    async generatePlatformSignature(): Promise<string> {
        // todo: need to fixed by FE and SC
        const message = 'Create party request is signed';
        return await this.web3Service.sign(message);
    }
}
