import { FindOptions, WhereOptions } from 'sequelize';
import {
    PaginationResponse,
    SequelizePaginator,
} from 'sequelize-typescript-paginator';
import { TransactionModel } from 'src/models/transaction.model';
import { IndexTransactionRequest } from '../requests/index-transaction.request';
import { TransactionResponse } from '../responses/transaction.response';

export class IndexTransactionService {
    private getFindOptions(
        query: IndexTransactionRequest,
    ): FindOptions<TransactionModel> {
        const where: WhereOptions<TransactionModel> = {};

        if (query.from) where.addressFrom = query.from;
        if (query.to) where.addressTo = query.to;

        return {
            where,
            order: [[query.order ?? 'created_at', query.order ?? 'desc']],
        };
    }

    private mapTransactionResponse(
        transactions: TransactionModel[],
    ): TransactionResponse[] {
        return transactions.map((transaction) =>
            TransactionResponse.mapFromTransactionModel(transaction),
        );
    }

    async fetch(
        query: IndexTransactionRequest,
    ): Promise<PaginationResponse<TransactionResponse>> {
        const options = this.getFindOptions(query);
        const { data, meta } = await SequelizePaginator.paginate(
            TransactionModel,
            { perPage: query.perPage ?? 10, page: query.page ?? 1, options },
        );

        const response = this.mapTransactionResponse(data);
        return {
            data: response,
            meta,
        };
    }
}
