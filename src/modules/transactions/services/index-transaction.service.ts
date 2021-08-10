import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { FindOptions, WhereOptions } from 'sequelize';
import {
    PaginationResponse,
    SequelizePaginator,
} from 'sequelize-typescript-paginator';
import { PartyModel } from 'src/models/party.model';
import { TransactionModel } from 'src/models/transaction.model';
import { IndexPartyTransactionRequest } from 'src/modules/parties/requests/transaction/index-party-transaction.request';
import { IndexTransactionRequest } from '../requests/index-transaction.request';
import { TransactionResponse } from '../responses/transaction.response';

@Injectable()
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
        return { data: response, meta };
    }

    async fetchByParty(
        party: PartyModel,
        query: IndexPartyTransactionRequest,
    ): Promise<PaginationResponse<TransactionResponse>> {
        const options: FindOptions<TransactionModel> = {
            where: {
                [Op.or]: {
                    addressFrom: party.address,
                    addressTo: party.address,
                },
            },
            order: [['created_at', 'desc']],
        };

        if (query.memberAddress) {
            options.where = {
                ...options.where,
                [Op.or]: {
                    addressFrom: query.memberAddress,
                    addressTo: query.memberAddress,
                },
            };
        }

        const { data, meta } = await SequelizePaginator.paginate(
            TransactionModel,
            { perPage: query.perPage ?? 10, page: query.page ?? 1, options },
        );

        const response = this.mapTransactionResponse(data);
        return { data: response, meta };
    }
}
