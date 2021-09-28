import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { UserModel } from 'src/models/user.model';
import { Repository } from 'typeorm';
import { ProfileRequest } from '../requests/profile.request';
import { GetUserService } from './get-user.service';

export class UpdateProfileService {
    constructor(
        @Inject(GetUserService)
        private readonly getUserService: GetUserService,
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
        @InjectRepository(UserModel)
        private readonly userRepository: Repository<UserModel>,
    ) {}

    private generateSignatureMessage(userId: string): string {
        return `I want to update my profile with user id of ${userId}`;
    }

    async update(address: string, request: ProfileRequest): Promise<UserModel> {
        let user = await this.getUserService.getUserByAddress(address);

        const message = this.generateSignatureMessage(user.id as string);
        // TODO: need to removed after testing
        console.log('message[update-profile]: ' + message);
        await this.web3Service.validateSignature(
            request.signature,
            address,
            message,
        );

        user = Object.assign(user, request);
        return this.userRepository.save(user);
    }
}
