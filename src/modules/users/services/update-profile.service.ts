import { Inject } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { UserModel } from 'src/models/user.model';
import { ProfileRequest } from '../requests/profile.request';
import { GetUserService } from './get-user.service';

export class UpdateProfileService {
    constructor(
        @Inject(GetUserService) private readonly getUserService: GetUserService,
        @Inject(Web3Service) private readonly web3Service: Web3Service,
    ) {}

    private generateSignatureMessage(userId: string): string {
        return `I want to update my profile with user id of ${userId}`;
    }

    async update(address: string, request: ProfileRequest): Promise<UserModel> {
        const user = await this.getUserService.getUserByAddress(address);

        const message = this.generateSignatureMessage(user.id);
        // TODO: need to removed after testing
        console.log('message[update-profile]: ' + message);
        await this.web3Service.validateSignature(
            request.signature,
            address,
            message,
        );

        user.setAttributes({
            ...request,
        });
        return await user.save();
    }
}
