import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { UserModel } from 'src/models/user.model';
import { Repository } from 'typeorm';

@Injectable()
export class GetSignerService {
    constructor(
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
        @InjectRepository(UserModel)
        private readonly repository: Repository<UserModel>,
    ) {}

    private generateGlobalSignature(): string {
        return `I want to access private information of PolkaParty`;
    }

    async get(signature: string, required = false): Promise<UserModel | null> {
        if (!signature) {
            if (required)
                throw new UnauthorizedException(
                    'Global signature not provided.',
                );
            else return null;
        }

        const signerAddress = await this.web3Service.recover(
            signature,
            this.generateGlobalSignature(),
        );

        const user = await this.repository.findOne({
            where: { address: signerAddress },
        });

        if (required) {
            if (!user)
                throw new UnauthorizedException('Address not registered');
        }

        return user;
    }
}
