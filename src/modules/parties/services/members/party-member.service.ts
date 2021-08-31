import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BN from 'bn.js';
import { IPartyMember } from 'src/entities/party-member.entity';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { Repository } from 'typeorm';

export class PartyMemberService {
    constructor(
        @InjectRepository(PartyMemberModel)
        private readonly partyMemberRepository: Repository<PartyMemberModel>,
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
    ) {}

    async store(data: IPartyMember): Promise<PartyMemberModel> {
        const partyMember = this.partyMemberRepository.create(data);
        return this.partyMemberRepository.save(partyMember);
    }

    async update(
        partyMember: PartyMemberModel,
        data: Partial<IPartyMember>,
    ): Promise<PartyMemberModel> {
        partyMember = Object.assign(partyMember, data);
        return await this.partyMemberRepository.save(partyMember);
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
        const party = await partyMember.party;
        const member = await partyMember.member;

        const message = this.web3Service.soliditySha3([
            { t: 'address', v: member.address },
            { t: 'address', v: party.address },
            { t: 'string', v: partyMember.id },
        ]);

        // TODO: need to removed after testing
        console.log('message[platform-join-party]: ' + message);
        return await this.web3Service.sign(message);
    }

    generateLeaveSignatureMessage({ name }: PartyModel): string {
        const message = `I want to leave ${name} party`;
        // TODO: need to removed after testing
        console.log('message[leave-party]: ' + message);
        return message;
    }
}
