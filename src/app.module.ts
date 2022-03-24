import { HttpException, Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RavenInterceptor, RavenModule } from 'nest-raven';
import { HttpExceptionFilter } from './common/filters/http-exeception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { connectionOption } from './infrastructure/databases';
import { BookModule } from './modules/book/book.module';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
    imports: [
        TypeOrmModule.forRoot(connectionOption),
        RavenModule,

        // write your module here

        BookModule, // example like this
        ScheduleModule.forRoot(),
    ],
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
