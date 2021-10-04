import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/node';
import { config } from './config';
import {
    initializeTransactionalContext,
    patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';
import { Logger } from '@nestjs/common';
import { WS } from './infrastructure/websocket/websocket.service';

async function bootstrap() {
    // Sentry
    Sentry.init({
        dsn: config.sentry.dsn,
        attachStacktrace: true,
        debug: config.nodeEnv !== 'local',
        environment: config.nodeEnv,
    });

    initializeTransactionalContext();
    patchTypeORMRepositoryWithBaseRepository();

    const app = await NestFactory.create(AppModule);

    app.enableCors();
    const port: string = config.port;
    await app.listen(port);
    Logger.log(`Application running on port ${port}`, 'NestApplication');
    WS.startLogger(300000);
}
bootstrap();
