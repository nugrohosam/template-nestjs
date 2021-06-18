import { IApiResponse } from '../interface/response.interface';
import { ErrorCodeEnum } from '../enums/error-code.enum';

export class Response {
    /**
     * generate success response
     */
    static success(
        message: string,
        data: [] | Record<string, any>,
    ): IApiResponse {
        return {
            success: true,
            message,
            data,
        };
    }

    static error(
        message: string,
        data: [] | Record<string, any>,
        code?: ErrorCodeEnum,
    ): IApiResponse {
        return {
            success: false,
            message,
            data,
            code: code ?? ErrorCodeEnum.Undefined,
        };
    }
}
