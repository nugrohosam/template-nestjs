import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Injectable } from '@nestjs/common';
import { config } from 'src/config';
import { ISwap0xResponse } from '../../responses/swap-quote.response';

@Injectable()
export class SwapQuoteService {
    constructor(private readonly httpService: HttpService) {}

    async getQuote(
        buyToken: string,
        sellToken: string,
        sellAmount: string,
    ): Promise<AxiosResponse<ISwap0xResponse>> {
        return this.httpService
            .get<ISwap0xResponse>(`${config.api.zerox}/swap/v1/quote`, {
                params: {
                    buyToken,
                    sellToken,
                    sellAmount,
                },
            })
            .toPromise();
    }
}
