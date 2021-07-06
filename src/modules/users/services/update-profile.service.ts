import { Inject } from '@nestjs/common';
import { UserModel } from 'src/models/user.model';
import { ProfileRequest } from '../requests/profile.request';
import { GetUserService } from './get-user.service';

export class UpdateProfileService {
    constructor(
        @Inject(GetUserService) private readonly getUserService: GetUserService,
    ) {}

    async update(address: string, request: ProfileRequest): Promise<UserModel> {
        const user = await this.getUserService.getUserByAddress(address);
        user.setAttributes({
            ...request,
        });
        return await user.save();
    }
}
