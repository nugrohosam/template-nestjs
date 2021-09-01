import { Module } from '@nestjs/common';
import { CommonModule } from '../commons/common.module';
import { MyPartiesApplication } from './applications/my-parties.application';
import { MePartiesController } from './controllers/parties.controller';

@Module({
    imports: [CommonModule],
    controllers: [MePartiesController],
    providers: [MyPartiesApplication],
})
export class MeModule {}
