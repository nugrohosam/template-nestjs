import { Inject, Injectable } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { UserModel } from 'src/models/user.model';

@Injectable()
export class GetSignerService {
    constructor(
        @Inject(Web3Service) private readonly web3Service: Web3Service,
    ) {}

    private generateGlobalSignature(): string {
        return `I want to access private information of PolkaParty`;
    }

    async get(signature: string): Promise<UserModel | null> {
        if (!signature) return null;

        const signerAddress = await this.web3Service.recover(
            signature,
            this.generateGlobalSignature(),
        );

        return await UserModel.findOne({
            where: { address: signerAddress },
        });
    }
}
