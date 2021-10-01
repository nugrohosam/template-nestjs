import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Headers,
} from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { SwapQuoteApplication } from '../applications/swap-quote.application';
import { SwapQuoteRequest } from '../requests/swap-quote.request';
import { SwapQuoteResponse } from '../responses/swap-quote.response';
import { SwapQuoteTransactionRequest } from '../requests/swap-quote-transaction';
import { GetSignerService } from 'src/modules/commons/providers/get-signer.service';

@Controller('parties/:partyId/swap')
export class SwapController {
    constructor(
        private readonly getSignerService: GetSignerService,
        private readonly swapQuoteApplication: SwapQuoteApplication,
    ) {}

    @Post('/transaction')
    async transaction(
        @Headers('Signature') signature: string,
        @Body() request: SwapQuoteTransactionRequest,
    ): Promise<IApiResponse<null>> {
        const user = await this.getSignerService.get(signature, true);
        const message = await this.swapQuoteApplication.transaction(
            request,
            user,
        );

        return {
            message: message,
            data: null,
        };
    }

    @Get('/quote')
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
