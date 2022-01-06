import { Controller, Get, Param, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { IndexRequest } from 'src/common/request/index.request';
import { IndexPartyTokenApplication } from '../applications/index-party-token.application';
import { BalanceResponse } from '../responses/balance/balance.response';

@Controller('parties/:partyId/balance')
export class PartyBalanceController {
    constructor(
        private readonly indexPartyTokenApplication: IndexPartyTokenApplication,
    ) {}

    @Get()
    async index(
        @Param('partyId') partyId: string,
        @Query() request: IndexRequest,
    ): Promise<IApiResponse<BalanceResponse>> {
        const { data, meta } = await this.indexPartyTokenApplication.fetch(
            partyId,
            request,
        );

        const balance = new BalanceResponse;
        balance.total = 1000;
        
        return {
            message: 'Success get balance of parties',
            data: balance,
            meta,
        };
    }
}
