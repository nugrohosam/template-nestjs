import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger } from '@nestjs/common';
import BN from 'bn.js';
import { config } from 'src/config';
import { IPartyMember } from 'src/entities/party-member.entity';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { Repository } from 'typeorm';
import { GetPartyService } from '../get-party.service';

@Injectable()
export class PartyMemberService {
    constructor(
        @InjectRepository(PartyMemberModel)
        private readonly partyMemberRepository: Repository<PartyMemberModel>,

        private readonly web3Service: Web3Service,
        private readonly getPartyService: GetPartyService,
        private readonly getUserService: GetUserService,
    ) {}

    async store(data: IPartyMember): Promise<PartyMemberModel> {
        const { id } = await this.partyMemberRepository.save(data);
        return this.partyMemberRepository.findOne(id);
    }

    async update(
        partyMember: PartyMemberModel,
        data: Partial<IPartyMember>,
    ): Promise<PartyMemberModel> {
        partyMember = Object.assign(partyMember, data);
        await this.partyMemberRepository.save(partyMember);
        return this.partyMemberRepository.findOne(partyMember.id);
    }

    async delete(
        partyMember: PartyMemberModel,
        softDelete = false,
    ): Promise<void> {
        if (softDelete) {
            await this.partyMemberRepository.softDelete(partyMember);
        } else {
            await this.partyMemberRepository.delete(partyMember);
        }
    }

    generateJoinSignature(party: PartyModel, deposit: BN): string {
        const message = `I want to join ${
            party.name
        } party with initial deposit of ${deposit.toString()} mwei`;

        // TODO: need to removed after testing
        console.log('message[request-join]: ' + message);
        return message;
    }

    async generatePlatformSignature(
        partyMember: PartyMemberModel,
    ): Promise<string> {
        const party = await this.getPartyService.getById(partyMember.partyId);
        const member = await this.getUserService.getUserById(
            partyMember.memberId,
        );

        const message = this.web3Service.soliditySha3([
            { t: 'address', v: member.address },
            { t: 'address', v: party.address },
            { t: 'string', v: partyMember.id },
        ]);

        // TODO: need to removed after testing
        console.log('message[platform-join-party]=: ' + message);
        return await this.web3Service.sign(message);
    }

    generateLeaveSignatureMessage({ name }: PartyModel): string {
        const message = `I want to leave ${name} party`;
        // TODO: need to removed after testing
        console.log('message[leave-party]: ' + message);
        return message;
    }

    generateKickSignatureMessage(
        partyMember: PartyMemberModel,
        party: PartyModel,
    ): string {
        const message = `I want to kick ${partyMember.memberId} from ${party.name} party`;
        // TODO: need to removed after testing
        console.log('message[kick-party-member]: ' + message);
        return message;
    }

    async generateLeavePlatformSignature(
        userAddress: string,
        weight: BN,
    ): Promise<string> {
        const message = this.web3Service.soliditySha3([
            { t: 'address', v: userAddress },
            { t: 'uint256', v: weight.toString() },
        ]);
        // TODO: need to removed after testing
        console.log('message[platform-join-party]: ' + message);
        return await this.web3Service.sign(message);
    }

    async updatePartyMemberWeight(
        partyMember: PartyMemberModel,
    ): Promise<PartyMemberModel> {
        const party = partyMember.party ?? (await partyMember.getParty);

        Logger.debug(party.id, 'partyId =>');

        partyMember.weight = partyMember.totalDeposit
            .muln(config.calculation.maxPercentage)
            .div(party.totalDeposit);

        return this.partyMemberRepository.save(partyMember);
    }

    async updatePartyMemberFund(
        partyMember: PartyMemberModel,
    ): Promise<PartyMemberModel> {
        const party = partyMember.party ?? (await partyMember.getParty);
        if (!partyMember.weight || partyMember.weight.isZero()) {
            partyMember.totalFund = new BN(0);
        } else {
            partyMember.totalFund = party.totalFund
                .mul(partyMember.weight)
                .divn(1000000);
        }

        return this.partyMemberRepository.save(partyMember);
    }
}
