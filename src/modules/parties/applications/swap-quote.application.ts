import { Web3Service } from 'src/infrastructure/web3/web3.service';

import { Transactional } from 'typeorm-transactional-cls-hooked';
import { SwapQuoteRequest } from '../requests/swap-quote.request';
import { SwapSignatureSerivce } from '../services/swap-signature.service';
import { GetPartyService } from 'src/modules/parties/services/get-party.service';
import { HttpService } from '@nestjs/axios';
import { config } from 'src/config';
import {
    ISwap0xResponse,
    SwapQuoteResponse,
} from '../responses/swap-quote.response';

export class SwapQuoteApplication {
    constructor(
        private readonly web3Service: Web3Service,
        private readonly swapSignatureService: SwapSignatureSerivce,
        private readonly getPartyService: GetPartyService,
        private readonly httpService: HttpService,
    ) {}

    @Transactional()
    async buy(
        partyId: string,
        request: SwapQuoteRequest,
    ): Promise<SwapQuoteResponse> {
        console.log('getPartyService', this.getPartyService);
        const party = await this.getPartyService.getById(partyId);
        // TODO need to validate that request.address is has permission to buy
        // because user will initiate transaction using a party name
        await this.web3Service.validateSignature(
            request.signature,
            party.owner.address,
            this.swapSignatureService.generateSwapBuySignature(
                request.buyToken,
                request.sellToken,
                request.buyAmount.toString(),
            ),
        );

        const quoteResponse = await this.httpService
            .get<ISwap0xResponse>(`${config.api.zerox}/swap`, {
                params: {
                    buyToken: request.buyToken,
                    sellToken: request.sellToken,
                    sellAmount: request.buyAmount,
                },
            })
            .toPromise();

        const quote = quoteResponse.data;
        const platformSignature =
            await this.swapSignatureService.generatePlatformSignature(
                quote.sellTokenAddress,
                quote.allowanceTarget,
                quote.to,
                quote.sellAmount,
            );

        return {
            data: quote,
            platformSignature,
        };
    }
}
