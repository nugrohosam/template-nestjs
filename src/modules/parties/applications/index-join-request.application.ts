import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginateResponse } from 'src/common/interface/index.interface';
import { IndexRequest } from 'src/common/request/index.request';
import { IndexApplication } from 'src/infrastructure/applications/index.application';
import { JoinRequestModel } from 'src/models/join-request.model';
import { UserModel } from 'src/models/user.model';
import { Repository } from 'typeorm';

@Injectable()
export class IndexJoinRequestApplication extends IndexApplication {
    constructor(
        @InjectRepository(JoinRequestModel)
        private readonly repository: Repository<JoinRequestModel>,
    ) {
        super();
    }

    async fetch(
        user: UserModel,
        request: IndexRequest,
    ): Promise<IPaginateResponse<JoinRequestModel>> {
        const query = this.repository.createQueryBuilder('joinRequests');
        query.where('user_id = :userId', { userId: user.id });

        query.orderBy(
            request.sort ?? 'joinRequests.createdAt',
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
