import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { IndexRequest } from 'src/common/request/index.request';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { CreatePartyAnnouncementApplication } from '../applications/create-party-announcement';
import { IndexPartyAnnouncementApplication } from '../applications/index-party-announcement.application ';
import { CreateAnnouncementRequest } from '../requests/announcement/create-party-announcement.request';
import { AnnouncementResponse } from '../responses/announcement/announcement.response';
import { GetPartyService } from '../services/get-party.service';
import { PartyValidation } from '../services/party.validation';

@Controller('parties/:partyId/announcements')
export class PartyAnnouncementController {
    constructor(
        private readonly indexPartyAnnouncementApplication: IndexPartyAnnouncementApplication,
        private readonly announcementApplication: CreatePartyAnnouncementApplication,
        private readonly getPartyService: GetPartyService,
        private readonly getUserService: GetUserService,

        private readonly partyValidation: PartyValidation,
    ) {}

    @Get()
    async index(
        @Param('partyId') partyId: string,
        @Query() query: IndexRequest,
    ): Promise<IApiResponse<AnnouncementResponse[]>> {
        const { data, meta } =
            await this.indexPartyAnnouncementApplication.fetch(partyId, query);

        const response = data.map((datum) => {
            return AnnouncementResponse.mapFromAnnouncementModel(datum);
        });

        return {
            message: "Success get party's announcements",
            data: response,
            meta,
        };
    }

    @Post()
    async create(
        @Param('partyId') partyId: string,
        @Body() request: CreateAnnouncementRequest,
    ): Promise<IApiResponse<AnnouncementResponse>> {
        const user = await this.getUserService.getUserByAddress(
            request.userAddress,
        );

        await this.partyValidation.getOwnedParty(request.partyId, user.id);
        const party = await this.getPartyService.getById(partyId);
        request.partyId = partyId;

        const createAnnouncement = await this.announcementApplication.call(
            user,
            party,
            request,
        );

        return {
            message: 'Success create announcement',
            data: AnnouncementResponse.mapFromAnnouncementModel(
                createAnnouncement,
            ),
        };
    }
}
