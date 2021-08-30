import { HttpException, Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RavenInterceptor, RavenModule } from 'nest-raven';
import { HttpExceptionFilter } from './common/filters/http-exeception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { config } from './config';
import { CurrencyModel } from './models/currency.model';
import { JoinRequestModel } from './models/join-request.model';
import { PartyMemberModel } from './models/party-member.model';
import { PartyModel } from './models/party.model';
import { ProposalDistributionModel } from './models/proposal-distribution.model';
import { ProposalVoteModel } from './models/proposal-vote.model';
import { Proposal } from './models/proposal.model';
import { TransactionModel } from './models/transaction.model';
import { UserModel } from './models/user.model';
import { CommonModule } from './modules/commons/common.module';
import { MeModule } from './modules/me/me.module';
import { PartyModule } from './modules/parties/party.module';
import { TransactionModule } from './modules/transactions/transaction.module';
import { UserModule } from './modules/users/user.module';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: config.database.host,
            port: +config.database.port,
            username: config.database.username,
            password: config.database.password,
            database: config.database.database,
            entities: [
                UserModel,
                PartyModel,
                PartyMemberModel,
                JoinRequestModel,
                TransactionModel,
                CurrencyModel,
                Proposal,
                ProposalVoteModel,
                ProposalDistributionModel,
            ],
            synchronize: false,
        }),
        RavenModule,
        UserModule,
        PartyModule,
        TransactionModule,
        CommonModule,
        MeModule,
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
