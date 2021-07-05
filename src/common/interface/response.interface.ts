import { PaginationMeta } from 'sequelize-typescript-paginator';

export interface IApiResponse<T> {
    message: string;
    meta?: PaginationMeta;
    data: T;
}

interface IDataUnprocessable {
    property: string;
    message: string[];
}

export interface IUnprocessableResponse {
    message: string;
    data: Array<IDataUnprocessable>;
}
