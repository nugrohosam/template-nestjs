import {
    Inject,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { UserModel } from 'src/models/user.model';
import { Repository } from 'typeorm';
import { RegisterRequest } from '../requests/register.request';

export class RegisterService {
    constructor(
        @InjectRepository(UserModel)
        private readonly userRepository: Repository<UserModel>,
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
    ) {}

    private generateRegisterSignatureMessage(userAddress: string): string {
        const message = `I want to register to PolkaParty with address ${userAddress}`;
        console.log('[register]: ' + message);
        return message;
    }

    private async validateRegisterSignature(
        registerRequest: RegisterRequest,
    ): Promise<void> {
        const signedAddress = await this.web3Service.recover(
            registerRequest.signature,
            this.generateRegisterSignatureMessage(registerRequest.tokenAddress),
        );

        if (signedAddress !== registerRequest.tokenAddress)
            throw new UnauthorizedException('Signature is invalid.');
    }

    private async validateAddressMustUnique(address: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { address } });

        if (user)
            throw new UnprocessableEntityException(
                'Failed to create. User token already registered.',
            );
    }

    async storeUserAddress(address: string): Promise<UserModel> {
        return this.userRepository.save({
            address,
            username: address,
        });
    }

    async register(request: RegisterRequest): Promise<UserModel> {
        await this.validateRegisterSignature(request);
        await this.validateAddressMustUnique(request.tokenAddress);

        return this.storeUserAddress(request.tokenAddress);
    }
}
