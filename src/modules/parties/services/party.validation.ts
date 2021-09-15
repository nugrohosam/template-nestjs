import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { Repository } from 'typeorm';

@Injectable()
export class PartyValidation {
    constructor(
        @InjectRepository(PartyModel)
        private readonly partyRepository: Repository<PartyModel>,
        private readonly getUserService: GetUserService,
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
}
