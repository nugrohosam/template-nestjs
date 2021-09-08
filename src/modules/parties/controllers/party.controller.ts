import {
    Body,
    Controller,
    Get,
    Headers,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { GetSignerService } from 'src/modules/commons/providers/get-signer.service';
import { CreatePartyApplication } from '../applications/create-party.application';
import { IndexPartyApplication } from '../applications/index-party.application';
import { CreatePartyRequest } from '../requests/create-party.request';
import { IndexPartyRequest } from '../requests/index-party.request';
import { RevertCreatePartyRequest } from '../requests/revert-create-party.request';
import { UpdateDeployedPartyDataRequest } from '../requests/update-transaction-hash.request';
import { CreatePartyResponse } from '../responses/create-party.response';
import { DetailPartyResponse } from '../responses/detail-party.response';
import { IndexPartyResponse } from '../responses/index-party.response';
import { GetPartyService } from '../services/get-party.service';

@Controller('parties')
export class PartyController {
    constructor(
        private readonly createPartyApplication: CreatePartyApplication,
        private readonly indexPartyApplication: IndexPartyApplication,
        private readonly getSignerService: GetSignerService,
        private readonly getPartyService: GetPartyService,
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
        console.log('this.getSignerService', this.getSignerService);
        const signer = await this.getSignerService.get(signature);
        console.log('signer', signer);
        const party = await this.getPartyService.getById(partyId, signer?.id);
        return {
            message: 'Success get party',
            data: await DetailPartyResponse.mapFromPartyModel(party),
        };
    }
}
