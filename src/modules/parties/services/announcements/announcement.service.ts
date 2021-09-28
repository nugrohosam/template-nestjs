import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IAnnouncement } from 'src/entities/announcement.entity';
import { AnnouncementModel } from 'src/models/announcement.model';
import { Repository } from 'typeorm';
import { PartyValidation } from '../party.validation';

@Injectable()
export class AnnouncementService {
    constructor(
        @InjectRepository(AnnouncementModel)
        private readonly repository: Repository<AnnouncementModel>,
        private readonly partyValidation: PartyValidation,
    ) {}

    generateCreateAnnouncementSignature(
        partyId: string,
        title: string,
    ): string {
        const message = `I want to create an announcement ${title} with id party ${partyId}`;

        console.log('message[create-announcement-party]: ' + message);
        return message;
    }

    async store(data: IAnnouncement): Promise<AnnouncementModel> {
        const party = this.repository.create(data);
        return this.repository.save(party);
    }
}
