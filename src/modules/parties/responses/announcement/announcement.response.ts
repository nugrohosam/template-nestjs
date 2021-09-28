import { IAnnouncement } from 'src/entities/announcement.entity';
import { AnnouncementModel } from 'src/models/announcement.model';
import { IndexPartyResponse } from '../index-party.response';

export class AnnouncementResponse
    implements Omit<IAnnouncement, 'partyId' | 'updatedAt' | 'deletedAt'>
{
    id?: string;
    party?: IndexPartyResponse;
    title: string;
    body: string;
    link?: string;

    static mapFromAnnouncementModel(
        model: AnnouncementModel,
    ): AnnouncementResponse {
        return {
            id: model.id,
            title: model.title,
            body: model.body,
            link: model.link,
            party: model.party
                ? IndexPartyResponse.mapFromPartyModel(model.party)
                : null,
        };
    }
}
