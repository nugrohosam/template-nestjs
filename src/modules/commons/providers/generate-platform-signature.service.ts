import { Injectable } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';

@Injectable()
export class GeneratePlatformSignature {
    constructor(private readonly web3Service: Web3Service) {}

    async closeParty(
        partyAddress: string,
        partyOwnerAddress: string,
    ): Promise<string> {
        return this.web3Service.sign(
            this.web3Service.soliditySha3([
                { t: 'address', v: partyAddress },
                { t: 'address', v: partyOwnerAddress },
            ]),
        );
    }
}
