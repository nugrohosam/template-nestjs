import { Injectable } from '@nestjs/common';
import { UserModel } from 'src/models/user.model';
import { GetUserService } from 'src/modules/users/services/get-user.service';

@Injectable()
export class PartyValidation {
    constructor(private readonly getUserService: GetUserService) {}

    async validateCreatorAddress(address: string): Promise<UserModel> {
        return await this.getUserService.getUserByAddress(address);
    }
}
