import { Injectable } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';

@Injectable()
export class SwapSignatureSerivce {
    constructor(private readonly web3Service: Web3Service) {}

    generateSwapBuySignature(
        buyToken: string,
        sellToken: string,
        buyAmount: string,
    ): string {
        const message = `I want to buy token with address ${buyToken} ${buyAmount} using token with address ${sellToken}`;
        console.log('[create-party]: ' + message);
        return message;
    }

    async generatePlatformSignature(
        sellTokenAddress: string,
        spender: string,
        swapTarget: string,
        amount: string,
    ): Promise<string> {
        const message = this.web3Service.soliditySha3([
            { t: 'address', v: sellTokenAddress },
            { t: 'address', v: spender },
            { t: 'address', v: swapTarget },
            { t: 'uint256', v: amount },
        ]);
        // TODO: need to removed after testing
        console.log('message[platform-swap-quote]: ' + message);
        return await this.web3Service.sign(message);
    }
}
