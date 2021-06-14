import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/node';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    // Sentry
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        attachStacktrace: true,
        debug: process.env.NODE_ENV !== 'local',
        environment: process.env.NODE_ENV,
    });

    const app = await NestFactory.create(AppModule);

    // Swagger
    const config = new DocumentBuilder()
        .addBearerAuth()
        .addBasicAuth()
        .setTitle('Polka War API')
        .setVersion('1.0')
        .setDescription('')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
        // Hide dto on bottom swagger
        swaggerOptions: { defaultModelsExpandDepth: -1 },
    });

    app.enableCors();
    await app.listen(3000);
}
bootstrap();
