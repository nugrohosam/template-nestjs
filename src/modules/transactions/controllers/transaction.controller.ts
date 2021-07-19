import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { TransferRequest } from '../requests/transfer.request';
import { UpdateTransferRequest } from '../requests/update-transfer.request';
import { GetTransactionService } from '../services/get-transaction.service';
import { TransferService } from '../services/transfer.service';
import { UpdateTransferService } from '../services/update-transfer.service';

@Controller('transactions')
export class TransactionController {
    constructor(
        private readonly transferService: TransferService,
        private readonly getTransactionService: GetTransactionService,
        private readonly updateTransferService: UpdateTransferService,
    ) {}

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

    @Put(':transactionId')
    async update(
        @Param('transactionId') transactionId: string,
        @Body() request: UpdateTransferRequest,
    ): Promise<IApiResponse<{ id: string }>> {
        const transaction = await this.getTransactionService.getById(
            transactionId,
        );
        await this.updateTransferService.update(transaction, request);

        // TODO: need to specify the transfer response
        return {
            message: 'Update transfer transaction success',
            data: {
                id: transaction.id,
            },
        };
    }
}
