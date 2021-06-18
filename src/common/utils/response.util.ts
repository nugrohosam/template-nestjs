import { IApiResponse } from '../interface/response.interface';

export class Response {
    /**
     * generate success response
     */
    static success(
        message: string,
        data: [] | Record<string, any>,
    ): IApiResponse {
        return {
            message,
            data,
        };
    }

    static error(
        message: string,
        data: [] | Record<string, any>,
    ): IApiResponse {
        return {
            message,
            data,
        };
    }
}
