import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';
import * as Sentry from '@sentry/node';

async function bootstrap() {
    // Sentry
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        attachStacktrace: true,
        debug: process.env.NODE_ENV !== 'local',
        environment: process.env.NODE_ENV,
    });

    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
}
bootstrap();
