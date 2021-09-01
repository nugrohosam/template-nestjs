import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
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

        const response = await Promise.all(
            data.map(async (datum) => {
                return TransactionResponse.mapFromTransactionModel(datum);
            }),
        );
        return {
            message: "Success fetch party's transactions",
            data: response,
            meta,
        };
    }
}
