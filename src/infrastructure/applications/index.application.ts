/**
 * Index Application
 * Used to fetch paginated data with any sort, filter and search
 */

import { OrderDirectionType } from 'src/common/enums/index.enum';
import {
    IPaginateRequest,
    IPaginateResponse,
    IPaginationMeta,
} from 'src/common/interface/index.interface';
import { IndexRequest } from 'src/common/request/index.request';

export abstract class IndexApplication {
    readonly DefaultPerPage: number = 10;
    readonly DefaultPage: number = 1;
    readonly DefaultSort: string = 'created_at';
    readonly DefaultOrder: OrderDirectionType = 'DESC';

    abstract fetch(
        params: IndexRequest,
    ): Promise<IPaginateResponse<Record<string, any>>>;

    countOffset({ page, perPage }: IPaginateRequest): number {
        page = page ?? this.DefaultPage;
        perPage = perPage ?? this.DefaultPerPage;

        return (page - 1) * perPage;
    }

    mapMeta(
        count: number,
        { page, perPage }: IPaginateRequest,
    ): IPaginationMeta {
        page = page ?? this.DefaultPage;
        perPage = perPage ?? this.DefaultPerPage;

        return {
            page: page,
            perPage: perPage,
            total: count,
            totalPage: count / perPage,
        };
    }
}
