import { Injectable } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { config } from 'src/config';
import { IParty } from 'src/entities/party.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyModel } from 'src/models/currency.model';
import { PartyTokenModel } from 'src/models/party-token.model';
import BN from 'bn.js';
import { GetPartyService } from './get-party.service';
import { PartyGainModel } from 'src/models/party-gain.model';

@Injectable()
export class PartyService {
    constructor(
        @InjectRepository(PartyModel)
        private readonly partyRepository: Repository<PartyModel>,
        @InjectRepository(PartyTokenModel)
        private readonly partyTokenRepository: Repository<PartyTokenModel>,
        @InjectRepository(PartyGainModel)
        private readonly partyGainRepository: Repository<PartyGainModel>,

        private readonly web3Service: Web3Service,
        private readonly getPartyService: GetPartyService,
    ) {}

    generateCreatePartySignatureMessage(partyName: string): string {
        const message = `I want to create party with name ${partyName}`;
        console.log('[create-party]: ' + message);
        return message;
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

    async store(data: IParty): Promise<PartyModel> {
        const party = this.partyRepository.create(data);
        return await this.partyRepository.save(party);
    }

    async update(
        party: PartyModel,
        data: Partial<IParty>,
    ): Promise<PartyModel> {
        party = Object.assign(party, data);
        return await this.partyRepository.save(party);
    }

    async delete(party: PartyModel): Promise<void> {
        await this.partyRepository.delete(party);
    }

    async storeToken(
        party: PartyModel,
        token: CurrencyModel,
    ): Promise<PartyTokenModel> {
        let partyToken = await this.getPartyService.getPartyTokenByAddress(
            party.id,
            token.address,
        );
        if (!partyToken) {
            partyToken = this.partyTokenRepository.create({
                partyId: party.id,
                address: token.address,
                symbol: token.symbol,
            });
        }

        return await this.partyTokenRepository.save(partyToken);
    }

    async updatePartyGain(party: PartyModel): Promise<PartyGainModel> {
        const previousGain = await this.getPartyService.getCurrentPartyGain(
            party.id,
        );

        const currentBalance = new BN(0); // TODO: need to get current party's total assets in base token
        const updatedPartyGain = this.partyGainRepository.create({
            partyId: party.id,
            fund: currentBalance,
            gain: previousGain.fund.sub(currentBalance),
        });

        return await this.partyGainRepository.save(updatedPartyGain);
    }
}
