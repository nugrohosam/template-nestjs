import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { CreatePartyRequest } from '../requests/create-party.request';
import { UpdateTransactionHashRequest } from '../requests/update-transaction-hash.request';
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

    @Put('/:partyId/transaction-hash')
    async updateTransactionHash(
        @Param('partyId') partyId: string,
        @Body() request: UpdateTransactionHashRequest,
    ): Promise<IApiResponse> {
        // todo: need to be cleared with sc for the contract abi
        return {
            message: 'Success update party transaction hash.',
            data: request,
        };
    }
}
