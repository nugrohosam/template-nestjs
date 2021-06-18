import { ErrorCodeEnum } from '../enums/error-code.enum';

export interface IApiResponse {
    success: boolean;
    message: string;
    data: [] | Record<string, any>;
    code?: ErrorCodeEnum;
}

interface IDataUnprocessable {
    property: string;
    message: string[];
}

export interface IUnprocessableResponse {
    message: string;
    data: Array<IDataUnprocessable>;
}
