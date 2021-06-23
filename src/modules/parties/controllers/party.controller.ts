import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { IParty } from 'src/entities/party.entity';
import { CreatePartyRequest } from '../requests/create-party.request';
import { UpdateTransactionHashRequest } from '../requests/update-transaction-hash.request';
import { CreatePartyResponse } from '../responses/create-party.response';
import { CreatePartyService } from '../services/create-party.service';
import { IndexPartyService } from '../services/index-party.service';
import { UpdateTransactionHashService } from '../services/update-transaction-hash.service';

@Controller('parties')
export class PartyController {
    constructor(
        private readonly indexPartyService: IndexPartyService,
        private readonly createPartyService: CreatePartyService,
        private readonly updateTransactionHashService: UpdateTransactionHashService,
    ) {}

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
        await this.updateTransactionHashService.updateParty(partyId, request);
        return {
            message: 'Success update party transaction hash.',
            data: null,
        };
    }

    @Get('/')
    async index(): Promise<IApiResponse> {
        return {
            message: 'Success fetching parties data',
            data: await this.indexPartyService.fetch(),
        };
    }
}
