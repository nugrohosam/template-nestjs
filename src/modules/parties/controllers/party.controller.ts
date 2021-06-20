import { Body, Controller, Post } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { CreatePartyRequest } from '../requests/create-party.request';
import { CreatePartyResponse } from '../responses/create-party.response';
import { CreatePartyService } from '../services/create-party.service';

@Controller('parties')
export class PartyController {
    constructor(private readonly createPartyService: CreatePartyService) {}

    @Post('/create')
    async store(@Body() request: CreatePartyRequest): Promise<IApiResponse> {
        const party = await this.createPartyService.create(request);
        const platformSignature =
            await this.createPartyService.generatePlatformSignature();

        return {
            message: 'Success create party.',
            data: CreatePartyResponse.mapFromPartyModel(
                party,
                platformSignature,
            ),
        };
    }
}
