import { Inject, UnprocessableEntityException } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { UserModel } from 'src/models/user.model';
import { RegisterRequest } from '../requests/register.request';

export class RegisterService {
    constructor(
        @Inject(Web3Service) private readonly web3Service: Web3Service,
    ) {}

    generateRegisterSignatureMessage(): string {
        // todo: need to fixed with fe and sc
        return 'register';
    }

    async validateRegisterSignature(
        registerRequest: RegisterRequest,
    ): Promise<void> {
        const signedAddress = await this.web3Service.recover(
            registerRequest.signature,
            this.generateRegisterSignatureMessage(),
        );

        if (signedAddress !== registerRequest.tokenAddress)
            throw new UnprocessableEntityException('Signature is invalid.');
    }

    async validateAddressMustUnique(address: string): Promise<void> {
        const user = await UserModel.findOne({
            where: { address },
        });

        if (user)
            throw new UnprocessableEntityException(
                'Failed to create. User token already registered.',
            );
    }

    async register(request: RegisterRequest): Promise<UserModel> {
        await this.validateRegisterSignature(request);
        await this.validateAddressMustUnique(request.tokenAddress);

        const user = new UserModel();
        user.address = request.tokenAddress;
        await user.save();

        return user;
    }
}
