import { NestFactory } from '@nestjs/core';
import {
    initializeTransactionalContext,
    patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';
import { GeckoCoinSeeder } from './modules/seeds/providers/gecko-coin.seeder';
import { SeedsModule } from './modules/seeds/seeds.module';

async function bootstrap() {
    initializeTransactionalContext();
    patchTypeORMRepositoryWithBaseRepository();

    const appContext = await NestFactory.createApplicationContext(SeedsModule);
    const geckoSeeder = appContext.get(GeckoCoinSeeder);

    await geckoSeeder.seed();

    appContext.close();
}
bootstrap();
