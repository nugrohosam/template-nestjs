import { Controller, Get, Param, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { WSService } from 'src/modules/commons/providers/ws-service';
import { SwapQuoteApplication } from '../applications/swap-quote.application';
import { SwapQuoteRequest } from '../requests/swap-quote.request';
import { SwapQuoteResponse } from '../responses/swap-quote.response';
import { eventSignature as SwapEventSignature } from 'src/contracts/SwapEvent.json';

@Controller('parties')
export class SwapController {
    constructor(
        private readonly swapQuoteApplication: SwapQuoteApplication,
        private readonly wsService: WSService,
    ) {
        this.wsService.registerHandler(SwapEventSignature, (data) => {
            console.log('data', data);
        });
    }
    @Get('/:partyId/swap/quote')
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
    }
}
