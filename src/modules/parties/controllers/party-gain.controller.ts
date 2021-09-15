import { Controller, Get, Param, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { IndexRequest } from 'src/common/request/index.request';
import { PartyGainModel } from 'src/models/party-gain.model';
import { IndexPartyGainApplication } from '../applications/index-party-gain.application';

@Controller('parties/:partyId/gains')
export class PartyGainController {
    constructor(private readonly indexApplication: IndexPartyGainApplication) {}

    @Get()
    async index(
        @Param('partyId') partyId: string,
        @Query() request: IndexRequest,
    ): Promise<IApiResponse<PartyGainModel[]>> {
        const { data, meta } = await this.indexApplication.fetch(
            partyId,
            request,
        );
        return { message: 'Success get party gains', data, meta };
    }
}
