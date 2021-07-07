import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { ProfileResponse } from 'src/modules/users/responses/profile.response';
import { CreatePartyRequest } from '../requests/create-party.request';
import { DeletePartyRequest } from '../requests/delete-party.request';
import { IndexPartyMemberRequest } from '../requests/index-party-member.request';
import { IndexPartyRequest } from '../requests/index-party.request';
import { JoinPartyRequest } from '../requests/join-party.request';
import { UpdateDeployedPartyDataRequest } from '../requests/update-transaction-hash.request';
import { CreatePartyResponse } from '../responses/create-party.response';
import { DetailPartyResponse } from '../responses/detail-party.response';
import { IndexPartyResponse } from '../responses/index-party.response';
import { JoinPartyResponse } from '../responses/join-party.response';
import { CreatePartyService } from '../services/create-party.service';
import { DeletePartyService } from '../services/delete-party.service';
import { GetPartyService } from '../services/get-party.service';
import { IndexPartyMemberService } from '../services/index-party-member.service';
import { IndexPartyService } from '../services/index-party.service';
import { JoinPartyService } from '../services/join-party.service';
import { UpdateTransactionHashService } from '../services/update-transaction-hash.service';

@Controller('parties')
export class PartyController {
    constructor(
        private readonly indexPartyService: IndexPartyService,
        private readonly getPartyService: GetPartyService,
        private readonly createPartyService: CreatePartyService,
        private readonly updateTransactionHashService: UpdateTransactionHashService,
        private readonly deletePartyService: DeletePartyService,
        private readonly joinPartyService: JoinPartyService,
        private readonly indexPartyMemberService: IndexPartyMemberService,
    ) {}

    @Post('/create')
    async store(
        @Body() request: CreatePartyRequest,
    ): Promise<IApiResponse<CreatePartyResponse>> {
        const party = await this.createPartyService.create(request);
        const creator = await party.$get('creator');
        const platformSignature =
            await this.createPartyService.generatePlatformSignature(
                party,
                creator,
            );

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
        @Body() request: UpdateDeployedPartyDataRequest,
    ): Promise<IApiResponse<null>> {
        await this.updateTransactionHashService.updateParty(partyId, request);
        return {
            message: 'Success update party transaction hash.',
            data: null,
        };
    }

    @Delete('/:partyId')
    async delete(
        @Param('partyId') partyId: string,
        @Body() request: DeletePartyRequest,
    ): Promise<IApiResponse<null>> {
        await this.deletePartyService.delete(partyId, request);
        return {
            message: 'Success delete party',
            data: null,
        };
    }

    @Get('/')
    async index(
        @Query() query: IndexPartyRequest,
    ): Promise<IApiResponse<IndexPartyResponse[]>> {
        const result = await this.indexPartyService.fetch(query);
        return {
            message: 'Success fetching parties data',
            ...result,
        };
    }

    @Get('/:partyId')
    async show(
        @Param('partyId') partyId: string,
    ): Promise<IApiResponse<DetailPartyResponse>> {
        const party = await this.getPartyService.getPartyById(partyId);
        return {
            message: 'Success get party',
            data: DetailPartyResponse.mapFromPartyModel(party),
        };
    }

    @Post('/:partyId/join')
    async join(
        @Param('partyId') partyId: string,
        @Body() request: JoinPartyRequest,
    ): Promise<IApiResponse<JoinPartyResponse>> {
        const partyMember = await this.joinPartyService.join(partyId, request);
        const platformSignature =
            await this.joinPartyService.generatePlatformSignature(partyMember);

        return {
            message: 'Success add user to party',
            data: JoinPartyResponse.mapFromPartyMemberModel(
                partyMember,
                platformSignature,
            ),
        };
    }

    @Get('/:partyId/members')
    async members(
        @Param('partyId') partyId: string,
        @Query() query: IndexPartyMemberRequest,
    ): Promise<IApiResponse<ProfileResponse[]>> {
        const result = await this.indexPartyMemberService.fetch(partyId, query);

        return {
            message: 'Success get user members',
            ...result,
        };
    }
}
