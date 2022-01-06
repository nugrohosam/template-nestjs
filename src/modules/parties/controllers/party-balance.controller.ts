import { Controller, Get, Param, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { IndexRequest } from 'src/common/request/index.request';
import { IndexPartyTokenApplication } from '../applications/index-party-token.application';
import { BalanceResponse } from '../responses/balance/balance.response';
import { GetPartyService } from '../services/get-party.service';

@Controller('parties/:partyId/balance')
export class PartyBalanceController {
    constructor(
        private readonly indexPartyTokenApplication: IndexPartyTokenApplication,
        private readonly getPartyService: GetPartyService,
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

        const total = this.getPartyService.getPartyBalance(
            partyId,
            data.map((item) => item.address),
        );
        const response = new BalanceResponse();
        response.total = total.toString();

        return {
            message: 'Success get balance of parties tokens',
            data: response,
            meta,
        };
    }
}
