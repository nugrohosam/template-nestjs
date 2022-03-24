import { InjectRepository } from '@nestjs/typeorm';
import { IPaginateResponse } from 'src/common/interface/index.interface';
import { IndexApplication } from 'src/infrastructure/applications/index.application';
import { Book } from 'src/models/book.model';
import { Repository } from 'typeorm';
import { BookIndexRequest } from '../requests/book-index.request';

export class BookIndexApplication extends IndexApplication {
    constructor(
        @InjectRepository(Book)
        private readonly repository: Repository<Book>,
    ) {
        super();
    }

    async fetch(request: BookIndexRequest): Promise<IPaginateResponse<Book>> {
        const query = this.repository.createQueryBuilder('books');

        if (request.search) {
            query.andWhere('book.title like :search', {
                search: '%' + request.search + '%',
            });
        }

        query.orderBy(request.sort ?? 'book.title', request.order ?? 'DESC');

        query.take(request.perPage ?? 10);
        query.skip(this.countOffset(request));

        const [data, count] = await query.getManyAndCount();
        return {
            data: data,
            meta: this.mapMeta(count, request),
        };
    }
}
