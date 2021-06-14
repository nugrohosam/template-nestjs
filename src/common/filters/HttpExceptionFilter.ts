import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();

        if (exception instanceof UnprocessableEntityException) {
            response.status(status).json(exception.getResponse());
            return;
        }
        response.status(status).json({
            code: status,
            message: exception.getResponse()['message'],
            data: exception.getResponse()['error'],
        });
    }
}
