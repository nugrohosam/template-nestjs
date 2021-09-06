import { Inject } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { config } from 'src/config';
import { GetPartyService } from './get-party.service';
import { IParty } from 'src/entities/party.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetUserService } from 'src/modules/users/services/get-user.service';

export class PartyService {
    constructor(
        @InjectRepository(PartyModel)
        private readonly repository: Repository<PartyModel>,
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
        @Inject(GetUserService)
        private readonly getUserService: GetUserService,
    ) {}

    generateCreatePartySignatureMessage(partyName: string): string {
        const message = `I want to create party with name ${partyName}`;
        console.log('[create-party]: ' + message);
        return message;
    }

    async validateCreatorAddress(address: string): Promise<UserModel> {
        return await this.getUserService.getUserByAddress(address);
    }

    async storeParty(data: IParty): Promise<PartyModel> {
        const party = this.repository.create(data);
        return await this.repository.save(party);
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

    async updateParty(
        party: PartyModel,
        data: Partial<IParty>,
    ): Promise<PartyModel> {
        party = Object.assign(party, data);
        this.repository.save(party);
        return party;
    }

    async deleteParty(party: PartyModel): Promise<void> {
        await this.repository.delete(party);
    }
}
