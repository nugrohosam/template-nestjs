import { Controller, Get, Param, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { SwapQuoteApplication } from '../application/swap-quote.application';
import { SwapQuoteRequest } from '../requests/swap-quote.request';
import { SwapQuoteResponse } from '../responses/swap-quote.response';

@Controller('swap')
export class SwapController {
    constructor(private readonly swapQuoteApplication: SwapQuoteApplication) {}
    @Get('quote')
    async getQuote(
        @Param('partyId') partyId: string,
        @Query() query: SwapQuoteRequest,
    ): Promise<IApiResponse<SwapQuoteResponse>> {
        const { data, platformSignature } = await this.swapQuoteApplication.buy(
            partyId,
            query,
        );
        return {
            message: 'Success create party.',
            data: {
                data,
                platformSignature,
            },
        };
        // TODO fetch 0x to get quote
        // generate platform signature from quote response
    }
}
