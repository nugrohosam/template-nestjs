import { IPaginationMeta } from './index.interface';

export interface IApiResponse {
    message: string;
    meta?: IPaginationMeta;
    data: [] | Record<string, any>;
}

interface IDataUnprocessable {
    property: string;
    message: string[];
}

export interface IUnprocessableResponse {
    message: string;
    data: Array<IDataUnprocessable>;
}
