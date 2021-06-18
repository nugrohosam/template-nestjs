import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { Response } from 'express';
import { Response as ResponseUtility } from '../utils/response.util';
import { ErrorCodeEnum } from '../enums/error-code.enum';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();

        if (exception instanceof UnprocessableEntityException) {
            const exceptionResponse = exception.getResponse();
            const data = exceptionResponse['data'] ?? null;
            const code = exceptionResponse['data']
                ? ErrorCodeEnum.RequestValidation
                : ErrorCodeEnum.BussinessValidation;

            response
                .status(status)
                .json(
                    ResponseUtility.error(
                        exceptionResponse['message'],
                        data,
                        code,
                    ),
                );
            return;
        }

        response
            .status(status)
            .json(
                ResponseUtility.error(
                    exception.getResponse()['message'],
                    exception.getResponse()['error'],
                ),
            );
    }
}
