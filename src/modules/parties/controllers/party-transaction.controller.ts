import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { IndexRequest } from 'src/common/request/index.request';
import { TransactionResponse } from 'src/modules/transactions/responses/transaction.response';
import { IndexTransactionService } from 'src/modules/transactions/services/index-transaction.service';
import { GetPartyService } from '../services/get-party.service';

@Controller('parties/:partyId/transactions')
export class PartyTransactionController {
    constructor(
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
        @Inject(IndexTransactionService)
        private readonly indexTransactionService: IndexTransactionService,
    ) {}

    @Get()
    async index(
        @Param('partyId') partyId: string,
        @Query() query: IndexRequest,
    ): Promise<IApiResponse<TransactionResponse[]>> {
        const party = await this.getPartyService.getById(partyId);
        const { data, meta } = await this.indexTransactionService.fetchByParty(
            party,
            query,
        );
        return {
            message: "Success fetch party's transactions",
            meta,
            data,
        };
    }
}
