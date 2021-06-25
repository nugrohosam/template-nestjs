import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/node';
import { config } from './config';

async function bootstrap() {
    // Sentry
    Sentry.init({
        dsn: config.sentry.dsn,
        attachStacktrace: true,
        debug: config.nodeEnv !== 'local',
        environment: config.nodeEnv,
    });

    const app = await NestFactory.create(AppModule);

    app.enableCors();
    await app.listen(3000);
}
bootstrap();
