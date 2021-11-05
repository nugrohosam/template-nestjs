import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { SwapTransactionResponse } from 'src/modules/transactions/responses/swap-transaction.response';
import { TransactionResponse } from 'src/modules/transactions/responses/transaction.response';
import { IndexPartyTransactionApplication } from '../applications/index-party-transaction.application';
import { IndexPartyTransactionRequest } from '../requests/transaction/index-party-transaction.request';
import { GetPartyService } from '../services/get-party.service';

@Controller('parties/:partyId/transactions')
export class PartyTransactionController {
    constructor(
        private readonly indexPartyTransactionApplication: IndexPartyTransactionApplication,

        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
    ) {}

    @Get()
    async index(
        @Param('partyId') partyId: string,
        @Query() query: IndexPartyTransactionRequest,
    ): Promise<IApiResponse<TransactionResponse[]>> {
        const party = await this.getPartyService.getById(partyId);
        const { data, meta } =
            await this.indexPartyTransactionApplication.fetch(party, query);

        const response = data.map((datum) => {
            return TransactionResponse.mapFromTransactionModel(datum);
        });

        return {
            message: "Success fetch party's transactions",
            data: response,
            meta,
        };
    }

    @Get('swaps')
    async swaps(
        @Param('partyId') partyId: string,
        @Query() query: IndexPartyTransactionRequest,
    ): Promise<IApiResponse<SwapTransactionResponse[]>> {
        const party = await this.getPartyService.getById(partyId);
        const { data, meta } =
            await this.indexPartyTransactionApplication.getSwapTransactions(
                party,
                query,
            );

        const owner = party.owner;
        const response = data.map((item) => {
            return SwapTransactionResponse.mapFromSwapTransactionModel(
                item,
                owner.address,
            );
        });

        return {
            message: "Success fetch party's swap transactions",
            data: response,
            meta,
        };
    }
}
