import { Inject, UnprocessableEntityException } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { UserModel } from 'src/models/user.model';
import { RegisterRequest } from '../requests/register.request';

export class RegisterService {
    constructor(
        @Inject(Web3Service) private readonly web3Service: Web3Service,
    ) {}

    private generateRegisterSignatureMessage(): string {
        // TODO: need to fixed with fe and sc
        return 'register';
    }

    private async validateRegisterSignature(
        registerRequest: RegisterRequest,
    ): Promise<void> {
        const signedAddress = await this.web3Service.recover(
            registerRequest.signature,
            this.generateRegisterSignatureMessage(),
        );

        if (signedAddress !== registerRequest.tokenAddress)
            throw new UnprocessableEntityException('Signature is invalid.');
    }

    private async validateAddressMustUnique(address: string): Promise<void> {
        const user = await UserModel.findOne({
            where: { address },
        });

        if (user)
            throw new UnprocessableEntityException(
                'Failed to create. User token already registered.',
            );
    }

    async storeUserAddress(address: string): Promise<UserModel> {
        return UserModel.create({
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
