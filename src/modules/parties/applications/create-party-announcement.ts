import { Injectable } from '@nestjs/common';
import { OffchainApplication } from 'src/infrastructure/applications/offchain.application';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { AnnouncementModel } from 'src/models/announcement.model';
import { PartyModel } from 'src/models/party.model';
<<<<<<< HEAD
import { GetUserService } from 'src/modules/users/services/get-user.service';
=======
import { UserModel } from 'src/models/user.model';
>>>>>>> party's announcements
import { CreateAnnouncementRequest } from '../requests/announcement/create-party-announcement.request';
import { AnnouncementService } from '../services/announcements/announcement.service';

@Injectable()
export class CreatePartyAnnouncementApplication extends OffchainApplication {
    constructor(
        private readonly web3Service: Web3Service,
        private readonly announcementService: AnnouncementService,
<<<<<<< HEAD
        private readonly getUserService: GetUserService,
=======
>>>>>>> party's announcements
    ) {
        super();
    }

    async call(
<<<<<<< HEAD
        party: PartyModel,
        request: CreateAnnouncementRequest,
    ): Promise<AnnouncementModel> {
        const user = await this.getUserService.getUserById(party.ownerId);
=======
        user: UserModel,
        party: PartyModel,
        request: CreateAnnouncementRequest,
    ): Promise<AnnouncementModel> {
>>>>>>> party's announcements
        await this.web3Service.validateSignature(
            request.signature,
            user.address,
            this.announcementService.generateCreateAnnouncementSignature(
                party.id,
                request.title,
            ),
        );

        return this.announcementService.store(request);
    }
}
