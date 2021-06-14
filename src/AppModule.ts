import { HttpException, Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { RavenInterceptor, RavenModule } from 'nest-raven';
import { HttpExceptionFilter } from './common/filters/HttpExceptionFilter';
import { ResponseInterceptor } from './common/interceptors/ResponseInterceptor';
import { ValidationPipe } from './common/pipes/ValidationPipe';
import { DatabaseModule } from './infrastructure/database/DatabaseModules';
import { UserModule } from './modules/users/UserModule';

@Module({
    imports: [DatabaseModule, RavenModule, UserModule],
    providers: [
        {
            // Global Error Handler
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
        {
            // Validation formatting response   
            provide: APP_PIPE,
            useClass: ValidationPipe,
        },
        {
            // Output response using snakecase
            provide: APP_INTERCEPTOR,
            useClass: ResponseInterceptor,
        },
        {
            // Sentry configuration
            provide: APP_INTERCEPTOR,
            useValue: new RavenInterceptor({
                filters: [
                    {
                        type: HttpException,
                        filter: (exception: HttpException) =>
                            500 > exception.getStatus(),
                    },
                ],
            }),
        },
    ],
})
export class AppModule {}
