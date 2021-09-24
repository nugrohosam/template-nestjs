import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginateResponse } from 'src/common/interface/index.interface';
import { IndexApplication } from 'src/infrastructure/applications/index.application';
import { PartyModel } from 'src/models/party.model';
import { SwapTransactionModel } from 'src/models/swap-transaction.model';
import { TransactionModel } from 'src/models/transaction.model';
import { IndexPartyTransactionRequest } from 'src/modules/parties/requests/transaction/index-party-transaction.request';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class IndexPartyTransactionApplication extends IndexApplication {
    constructor(
        @InjectRepository(TransactionModel)
        private readonly transactionRepository: Repository<TransactionModel>,
        @InjectRepository(SwapTransactionModel)
        private readonly swapTransactionRepository: Repository<SwapTransactionModel>,
    ) {
        super();
    }

    async fetch(
        party: PartyModel,
        request: IndexPartyTransactionRequest,
    ): Promise<IPaginateResponse<TransactionModel>> {
        const query =
            this.transactionRepository.createQueryBuilder('transactions');

        query.where(
            new Brackets((qb) => {
                qb.where('party_id = :partyId').orWhere(
                    'address_to = :partyAddress',
                    { partyAddress: party.address },
                );
            }),
        );

        query.orderBy(
            request.sort ?? 'transactions.createdAt',
            request.order ?? 'DESC',
        );
        query.take(request.perPage ?? this.DefaultPerPage);
        query.skip(this.countOffset(request));

        const [data, count] = await query.getManyAndCount();
        return { data, meta: this.mapMeta(count, request) };
    }

    async getSwapTransactions(
        party: PartyModel,
        request: IndexPartyTransactionRequest,
    ): Promise<IPaginateResponse<SwapTransactionModel>> {
        const query =
            this.swapTransactionRepository.createQueryBuilder(
                'swapTransactions',
            );

        query.where('party_id = :partyId', { partyId: party.id });

        query.orderBy(
            request.sort ?? 'swapTransactions.createdAt',
            request.order ?? 'DESC',
        );
        query.take(request.perPage ?? this.DefaultPerPage);
        query.skip(this.countOffset(request));

        const [data, count] = await query.getManyAndCount();
        return { data, meta: this.mapMeta(count, request) };
    }
}
