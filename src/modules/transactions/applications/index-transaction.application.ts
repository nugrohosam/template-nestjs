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

    async fetch({
        from,
        to,
        order,
        sort,
        perPage,
        page,
    }: IndexTransactionRequest): Promise<IPaginateResponse<TransactionModel>> {
        const query = this.repository
            .createQueryBuilder('transactions')
            .setParameters({
                from,
                to,
            });

        if (from || to) {
            query.where(
                new Brackets((qb) => {
                    qb.where('transaction.address_from = :from');
                    qb.orWhere('transaction.address_to = :to');
                }),
            );
        }

        query.orderBy(sort ?? 'transactions.created_at', order ?? 'DESC');
        query.take(perPage ?? 10);
        query.skip(page ? (page - 1) * perPage : 0);
        const [data, count] = await query.getManyAndCount();

        return {
            data: data,
            meta: {
                page: page ?? 1,
                perPage: perPage ?? 10,
                total: count,
                totalPage: Math.ceil(count / perPage),
            },
        };
    }
}
