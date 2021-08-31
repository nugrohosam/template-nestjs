import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PartyModel } from 'src/models/party.model';
import { Repository } from 'typeorm';

@Injectable()
export class GetPartyService {
    constructor(
        @InjectRepository(PartyModel)
        private readonly repository: Repository<PartyModel>,
    ) {}

    async getById(partyId: string): Promise<PartyModel> {
        const party = await this.repository.findOne({
            where: { id: partyId },
            relations: ['owner', 'creator'],
        });
        if (!party) throw new NotFoundException('Party not found.');
        return party;
    }

    async getByAddress(address: string): Promise<PartyModel> {
        const party = await this.repository.findOne({
            where: { address },
        });
        if (!party) throw new NotFoundException('Party not found');
        return party;
    }

    async getByTransactionHash(transactionHash: string): Promise<PartyModel> {
        const party = await this.repository.findOne({
            where: { transactionHash },
        });
        if (!party) throw new NotFoundException('Party not found');
        return party;
    }
}
