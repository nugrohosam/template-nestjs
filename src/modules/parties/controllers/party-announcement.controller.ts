import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { IndexRequest } from 'src/common/request/index.request';
<<<<<<< HEAD
=======
import { GetUserService } from 'src/modules/users/services/get-user.service';
>>>>>>> party's announcements
import { CreatePartyAnnouncementApplication } from '../applications/create-party-announcement';
import { IndexPartyAnnouncementApplication } from '../applications/index-party-announcement.application ';
import { CreateAnnouncementRequest } from '../requests/announcement/create-party-announcement.request';
import { AnnouncementResponse } from '../responses/announcement/announcement.response';
import { GetPartyService } from '../services/get-party.service';
<<<<<<< HEAD
=======
import { PartyValidation } from '../services/party.validation';
>>>>>>> party's announcements

@Controller('parties/:partyId/announcements')
export class PartyAnnouncementController {
    constructor(
        private readonly indexPartyAnnouncementApplication: IndexPartyAnnouncementApplication,
        private readonly announcementApplication: CreatePartyAnnouncementApplication,
        private readonly getPartyService: GetPartyService,
<<<<<<< HEAD
=======
        private readonly getUserService: GetUserService,

        private readonly partyValidation: PartyValidation,
>>>>>>> party's announcements
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
<<<<<<< HEAD
=======
        const user = await this.getUserService.getUserByAddress(
            request.userAddress,
        );

        await this.partyValidation.getOwnedParty(request.partyId, user.id);
>>>>>>> party's announcements
        const party = await this.getPartyService.getById(partyId);
        request.partyId = partyId;

        const createAnnouncement = await this.announcementApplication.call(
<<<<<<< HEAD
=======
            user,
>>>>>>> party's announcements
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
