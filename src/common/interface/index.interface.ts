// Index Request

import { OrderDirectionEnum } from '../enums/index.enum';

export interface ISortRequest {
    sort?: string;
    order?: OrderDirectionEnum;
}

export interface IPaginateRequest {
    limit?: number;
    offset?: number;
}

// Index Response

export interface IPaginationMeta {
    limit: number;
    offset: number;
    total: number;
}

export interface IPaginateResponse {
    meta: IPaginationMeta;
    data: [] | Record<string, any>;
}
