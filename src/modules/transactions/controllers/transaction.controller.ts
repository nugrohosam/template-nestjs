import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { DeleteIncompleteDataRequest } from 'src/common/request/delete-incomplete-data.request';
import { IndexTransactionRequest } from '../requests/index-transaction.request';
import { TransferRequest } from '../requests/transfer.request';
import { UpdateTransferRequest } from '../requests/update-transfer.request';
import { TransactionResponse } from '../responses/transaction.response';
import { GetTransactionService } from '../services/get-transaction.service';
import { IndexTransactionService } from '../services/index-transaction.service';
import { TransferService } from '../services/transfer.service';
import { UpdateTransferService } from '../services/update-transfer.service';

@Controller('transactions')
export class TransactionController {
    constructor(
        private readonly transferService: TransferService,
        private readonly getTransactionService: GetTransactionService,
        private readonly updateTransferService: UpdateTransferService,
        private readonly indexTransactionService: IndexTransactionService,
    ) {}

    @Post('transfer')
    async prepareTransfer(
        @Body() request: TransferRequest,
    ): Promise<IApiResponse<TransactionResponse>> {
        const transaction = await this.transferService.transfer(request);

        return {
            message: 'Transfer success.',
            data: TransactionResponse.mapFromTransactionModel(transaction),
        };
    }

    @Put(':transactionId/transaction-hash')
    async updateIncompleteTransfer(
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

    @Delete(':transactionId/transaction-hash')
    async deleteIncompleteTransfer(
        @Param('transactionId') transactionId: string,
        @Body() { signature }: DeleteIncompleteDataRequest,
    ): Promise<IApiResponse<null>> {
        const transaction = await this.getTransactionService.getById(
            transactionId,
        );
        await this.updateTransferService.delete(transaction, signature);
        return {
            message: 'Success delete incomplete transfer data',
            data: null,
        };
    }

    @Get()
    async index(
        @Query() query: IndexTransactionRequest,
    ): Promise<IApiResponse<TransactionResponse[]>> {
        const { data, meta } = await this.indexTransactionService.fetch(query);
        return {
            message: 'Success fetch transaction logs',
            meta,
            data,
        };
    }
}
