import { HttpException, Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RavenInterceptor, RavenModule } from 'nest-raven';
import { HttpExceptionFilter } from './common/filters/http-exeception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { connectionOption } from './infrastructure/databases';
import { CommonModule } from './modules/commons/common.module';
import { MeModule } from './modules/me/me.module';
import { PartyModule } from './modules/parties/party.module';
import { TransactionModule } from './modules/transactions/transaction.module';
import { UserModule } from './modules/users/user.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WebsocketModule } from './infrastructure/websocket/websocket.module';
@Module({
    imports: [
        TypeOrmModule.forRoot(connectionOption),
        RavenModule,
        UserModule,
        PartyModule,
        TransactionModule,
        CommonModule,
        MeModule,
        WebsocketModule,
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
