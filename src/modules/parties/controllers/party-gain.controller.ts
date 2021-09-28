import { Controller, Get, Param } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { PartyGainModel } from 'src/models/party-gain.model';
import { IndexPartyGainApplication } from '../applications/index-party-gain.application';

@Controller('parties/:partyId/gains')
export class PartyGainController {
    constructor(private readonly indexApplication: IndexPartyGainApplication) {}

    @Get()
    async index(
        @Param('partyId') partyId: string,
    ): Promise<IApiResponse<PartyGainModel[]>> {
        const data = await this.indexApplication.fetch(partyId);
        return { message: 'Success get party gains', data };
    }
}
