import { InjectRepository } from '@nestjs/typeorm';
import { IPaginateResponse } from 'src/common/interface/index.interface';
import { IndexApplication } from 'src/infrastructure/applications/index.application';
import { TransactionModel } from 'src/models/transaction.model';
import { Brackets, Repository } from 'typeorm';
import { IndexTransactionRequest } from '../requests/index-transaction.request';

export class IndexTransactionApplication extends IndexApplication {
    constructor(
        @InjectRepository(TransactionModel)
        private readonly repository: Repository<TransactionModel>,
    ) {
        super();
    }

    async fetch(
        request: IndexTransactionRequest,
    ): Promise<IPaginateResponse<TransactionModel>> {
        const query = this.repository.createQueryBuilder('transactions');

        if (request.from || request.to) {
            query.where(
                new Brackets((qb) => {
                    qb.where('transaction.address_from = :from', {
                        from: request.from,
                    });
                    qb.orWhere('transaction.address_to = :to', {
                        to: request.to,
                    });
                }),
            );
        }

        query.orderBy(
            request.sort ?? this.DefaultSort,
            request.order ?? this.DefaultOrder,
        );
        query.take(request.perPage ?? this.DefaultPerPage);
        query.skip(this.countOffset(request));
        const [data, count] = await query.getManyAndCount();

        return {
            data: data,
            meta: this.mapMeta(count, request),
        };
    }
}
