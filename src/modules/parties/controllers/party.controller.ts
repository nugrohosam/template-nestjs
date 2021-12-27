import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Headers,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { config } from 'src/config';
import { GetSignerService } from 'src/modules/commons/providers/get-signer.service';
import { TransactionVolumeService } from 'src/modules/transactions/services/transaction-volume.service';
import { CreatePartyApplication } from '../applications/create-party.application';
import { IndexPartyApplication } from '../applications/index-party.application';
import { UpdatePartyApplication } from '../applications/update-party.application';
import { CreatePartyRequest } from '../requests/create-party.request';
import { IndexPartyRequest } from '../requests/index-party.request';
import { RevertCreatePartyRequest } from '../requests/revert-create-party.request';
import { UpdatePartyRequest } from '../requests/update-party.request';
import { UpdateDeployedPartyDataRequest } from '../requests/update-transaction-hash.request';
import { CreatePartyResponse } from '../responses/create-party.response';
import { DetailPartyResponse } from '../responses/detail-party.response';
import { IndexPartyResponse } from '../responses/index-party.response';
import { GetPartyService } from '../services/get-party.service';
import { PartyGainService } from '../services/party-gain/party-gain.service';

@Controller('parties')
export class PartyController {
    constructor(
        private readonly createPartyApplication: CreatePartyApplication,
        private readonly indexPartyApplication: IndexPartyApplication,
        private readonly updatePartyApplication: UpdatePartyApplication,
        private readonly getSignerService: GetSignerService,
        private readonly getPartyService: GetPartyService,
        private readonly partyGainService: PartyGainService,
        private readonly transactionVolumeService: TransactionVolumeService,
    ) {}

    @Post('/create')
    async prepare(
        @Body() request: CreatePartyRequest,
    ): Promise<IApiResponse<CreatePartyResponse>> {
        const { data, platformSignature } =
            await this.createPartyApplication.prepare(request);

        return {
            message: 'Success create party.',
            data: CreatePartyResponse.mapFromPartyModel(
                data,
                platformSignature,
            ),
        };
    }

    @Put('/:partyId/transaction-hash')
    async commit(
        @Param('partyId') partyId: string,
        @Body() request: UpdateDeployedPartyDataRequest,
    ): Promise<IApiResponse<null>> {
        await this.createPartyApplication.commit(partyId, request);
        return {
            message: 'Success update party transaction hash.',
            data: null,
        };
    }

    @Put('/:partyId/transaction-hash/revert')
    async revertCreateParty(
        @Body() request: RevertCreatePartyRequest,
    ): Promise<IApiResponse<null>> {
        await this.createPartyApplication.revert(request);
        return {
            message: 'Success delete party',
            data: null,
        };
    }

    @Delete('/:partyId')
    async deleteCreateParty(
        @Param('partyId') partyId: string,
        @Body() request: RevertCreatePartyRequest,
    ): Promise<IApiResponse<null>> {
        await this.createPartyApplication.deletePartyCreation(request, partyId);
        return {
            message: 'Success delete party',
            data: null,
        };
    }

    @Get('/')
    async index(
        @Query() query: IndexPartyRequest,
    ): Promise<IApiResponse<IndexPartyResponse[]>> {
        const { data, meta } = await this.indexPartyApplication.fetch(query);
        const response = data.map((datum) => {
            return IndexPartyResponse.mapFromPartyModel(datum);
        });

        return {
            message: 'Success fetching parties data',
            data: response,
            meta,
        };
    }

    @Get('/:partyId')
    async show(
        @Headers('Signature') signature: string,
        @Param('partyId') partyId: string,
    ): Promise<IApiResponse<DetailPartyResponse>> {
        const signer = await this.getSignerService.get(signature);
        const party = await this.getPartyService.getById(partyId, signer?.id);
        const partyVolume = await this.transactionVolumeService.get24Hours(
            partyId,
        );

        return {
            message: 'Success get party',
            data: DetailPartyResponse.mapFromPartyModel(party, partyVolume),
        };
    }

    // TODO: endoint for testing volume
    @Get('/:partyId/volume')
    async volume(
        @Param('partyId') partyId: string,
    ): Promise<IApiResponse<{ partyId: string; sum: string }>> {
        const sum = await this.transactionVolumeService.get24Hours(partyId);
        return {
            message: 'Success get party',
            data: {
                partyId: partyId,
                sum,
            },
        };
    }

    @Put('/:partyId')
    async update(
        @Param('partyId') partyId: string,
        @Body() request: UpdatePartyRequest,
    ): Promise<IApiResponse<DetailPartyResponse>> {
        let party = await this.getPartyService.getById(partyId);
        party = await this.updatePartyApplication.call(party, request);

        return {
            message: 'Success update party',
            data: DetailPartyResponse.mapFromPartyModel(party),
        };
    }

    // For Manual Test
    @Post('/party-gain-sync')
    async partyGainSync(): Promise<IApiResponse<null>> {
        if (config.nodeEnv == 'production' || config.nodeEnv == 'staging') {
            throw new BadRequestException();
        }
        this.partyGainService.updatePartiesGain();

        return {
            message: 'Party Gain is working',
            data: null,
        };
    }
}
