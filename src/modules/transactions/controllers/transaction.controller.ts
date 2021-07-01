import { Body, Controller, Post } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { TransferRequest } from '../requests/transfer.request';
import { TransferService } from '../services/transfer.service';

@Controller('transactions')
export class TransactionController {
    constructor(private readonly transferService: TransferService) {}

    @Post('transfer')
    async transfer(
        @Body() request: TransferRequest,
    ): Promise<IApiResponse<{ id: string }>> {
        const transaction = await this.transferService.transfer(request);

        // TODO: need to specify the transfer response
        return {
            message: 'Transfer success.',
            data: {
                id: transaction.id,
            },
        };
    }
}
