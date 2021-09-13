import { Controller, Get, Param, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { IndexRequest } from 'src/common/request/index.request';
import { PartyTokenModel } from 'src/models/party-token.model';
import { IndexPartyTokenApplication } from '../applications/index-party-token.application';

@Controller('parties/:partyId/tokens')
export class PartyTokenController {
    constructor(
        private readonly indexPartyTokenApplication: IndexPartyTokenApplication,
    ) {}

    @Get()
    async index(
        @Param('partyId') partyId: string,
        @Query() request: IndexRequest,
    ): Promise<IApiResponse<PartyTokenModel[]>> {
        const { data, meta } = await this.indexPartyTokenApplication.fetch(
            partyId,
            request,
        );

        return {
            message: 'Success get party tokens',
            data,
            meta,
        };
    }
}
