import { Controller, Get, Param, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { IndexRequest } from 'src/common/request/index.request';
import { IndexPartyTokenApplication } from '../applications/index-party-token.application';
import { PartyTokenResponse } from '../responses/token/party-token.response';

@Controller('parties/:partyId/tokens')
export class PartyTokenController {
    constructor(
        private readonly indexPartyTokenApplication: IndexPartyTokenApplication,
    ) {}

    @Get()
    async index(
        @Param('partyId') partyId: string,
        @Query() request: IndexRequest,
    ): Promise<IApiResponse<PartyTokenResponse[]>> {
        const { data, meta } = await this.indexPartyTokenApplication.fetch(
            partyId,
            request,
        );

        const response = data.map((datum) => {
            return PartyTokenResponse.mapFromPartyTokenModel(datum);
        });

        return {
            message: 'Success get party tokens',
            data: response,
            meta,
        };
    }
}
