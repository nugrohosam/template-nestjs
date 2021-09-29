import { HttpService } from '@nestjs/axios';
import { AxiosResponse, AxiosError } from 'axios';
import { Injectable } from '@nestjs/common';
import { config } from 'src/config';
import {
    ISwap0xError,
    ISwap0xResponse,
} from '../../responses/swap-quote.response';

@Injectable()
export class SwapQuoteService {
    constructor(private readonly httpService: HttpService) {}

    // Handling error delegated to application layer
    // which is it can be thrown as an error or it can be ignored
    async getQuote(
        buyToken: string,
        sellToken: string,
        sellAmount: string,
    ): Promise<{
        data: AxiosResponse<ISwap0xResponse> | undefined;
        err: AxiosError<ISwap0xError> | undefined;
    }> {
        return this.httpService
            .get<ISwap0xResponse>(`${config.api.zerox}/swap/v1/quote`, {
                params: {
                    buyToken,
                    sellToken,
                    sellAmount,
                },
            })
            .toPromise()
            .then((resp) => {
                return {
                    data: resp,
                    err: undefined,
                };
            })
            .catch((err: AxiosError<ISwap0xError>) => {
                return {
                    data: undefined,
                    err,
                };
            });
    }
}
