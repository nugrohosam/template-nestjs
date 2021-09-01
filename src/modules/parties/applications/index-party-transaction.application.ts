import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginateResponse } from 'src/common/interface/index.interface';
import { IndexApplication } from 'src/infrastructure/applications/index.application';
import { PartyModel } from 'src/models/party.model';
import { TransactionModel } from 'src/models/transaction.model';
import { IndexPartyTransactionRequest } from 'src/modules/parties/requests/transaction/index-party-transaction.request';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class IndexPartyTransactionApplication extends IndexApplication {
    constructor(
        @InjectRepository(TransactionModel)
        private readonly repository: Repository<TransactionModel>,
    ) {
        super();
    }

    async fetch(
        party: PartyModel,
        request: IndexPartyTransactionRequest,
    ): Promise<IPaginateResponse<TransactionModel>> {
        const query = this.repository.createQueryBuilder('transactions');

        query
            .setParameters({
                partyAddress: party.address,
            })
            .where(
                new Brackets((qb) => {
                    qb.where('address_from = :partyAddress').orWhere(
                        'address_to = :partyAddress',
                    );
                }),
            );

        query.orderBy(
            request.sort ?? 'transactions.created_at',
            request.order ?? 'DESC',
        );
        query.take(request.perPage ?? this.DefaultPerPage);
        query.skip(this.countOffset(request));

        const [data, count] = await query.getManyAndCount();
        return { data, meta: this.mapMeta(count, request) };
    }
}
