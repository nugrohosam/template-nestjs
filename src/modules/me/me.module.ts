import { Module } from '@nestjs/common';
import { CommonModule } from '../commons/common.module';
import { MePartiesController } from './controllers/parties.controller';
import { MePartiesService } from './services/parties.service';

@Module({
    imports: [CommonModule],
    controllers: [MePartiesController],
    providers: [MePartiesService],
})
export class MeModule {}
