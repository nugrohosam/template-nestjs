import { InjectRepository } from '@nestjs/typeorm';
import { IPaginateResponse } from 'src/common/interface/index.interface';
import { IndexRequest } from 'src/common/request/index.request';
import { IndexApplication } from 'src/infrastructure/applications/index.application';
import { AnnouncementModel } from 'src/models/announcement.model';
import { Repository } from 'typeorm';

export class IndexPartyAnnouncementApplication extends IndexApplication {
    constructor(
        @InjectRepository(AnnouncementModel)
        private readonly repository: Repository<AnnouncementModel>,
    ) {
        super();
    }

    async fetch(
        partyId: string,
        request: IndexRequest,
    ): Promise<IPaginateResponse<AnnouncementModel>> {
        const query = this.repository.createQueryBuilder('announcements');
        query.leftJoinAndSelect('announcements.party', 'party');
        query.where('party_id = :partyId', { partyId });

        query.orderBy(
            request.sort ?? 'announcements.createdAt',
            request.order ?? 'DESC',
        );
        query.take(request.perPage ?? this.DefaultPerPage);
        query.skip(this.countOffset(request));

        const [data, count] = await query.getManyAndCount();
        return {
            data,
            meta: this.mapMeta(count, request),
        };
    }
}
