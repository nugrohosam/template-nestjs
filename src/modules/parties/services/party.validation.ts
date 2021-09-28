import {
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { Repository } from 'typeorm';
import { GetPartyService } from './get-party.service';

@Injectable()
export class PartyValidation {
    constructor(
        @InjectRepository(PartyModel)
        private readonly partyRepository: Repository<PartyModel>,
        private readonly getUserService: GetUserService,
        private readonly getPartyService: GetPartyService,
    ) {}

    async validateCreatorAddress(address: string): Promise<UserModel> {
        return await this.getUserService.getUserByAddress(address);
    }

    async validatePartyName(partyName: string): Promise<void> {
        const party = await this.partyRepository
            .createQueryBuilder('party')
            .where('name = :partyName', { partyName })
            .getOne();
        if (party)
            throw new UnprocessableEntityException(
                `Party with name ${partyName} already exists. Please choose different name.`,
            );
    }

    async getOwnedParty(partyId: string, userId?: string): Promise<PartyModel> {
        const party = this.partyRepository
            .createQueryBuilder('party')
            .where('id = :partyId', { partyId })
            .andWhere('creator_id = :userId', { userId })
            .getOne();

        if (!party) throw new NotFoundException('Party not found.');

        return party;
    }

    async validateAddressNotExists(address: string): Promise<void> {
        if (await this.getPartyService.getByAddress(address, false)) {
            throw new UnprocessableEntityException(
                'Party with given address already exists.',
            );
        }
    }

    async validateTransactionHashNotExists(
        transactionHash: string,
    ): Promise<void> {
        if (
            await this.getPartyService.getByTransactionHash(
                transactionHash,
                false,
            )
        ) {
            throw new UnprocessableEntityException(
                'Party with given transaction hash already exists.',
            );
        }
    }
}
