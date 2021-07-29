// Index Request

import { OrderDirectionEnum } from '../enums/index.enum';

export interface ISortRequest {
    sort?: string;
    order?: OrderDirectionEnum;
}

export interface IPaginateRequest {
    perPage?: number;
    page?: number;
}

// Index Response

export interface IPaginationMeta {
    limit: number;
    offset: number;
    total: number;
}

export interface IPaginateResponse<T> {
    meta: IPaginationMeta;
    data: Array<T>;
}
