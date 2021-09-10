import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartyModel } from 'src/models/party.model';
import { CommonModule } from '../commons/common.module';
import { MyPartiesApplication } from './applications/my-parties.application';
import { MePartiesController } from './controllers/parties.controller';

@Module({
    imports: [CommonModule, TypeOrmModule.forFeature([PartyModel])],
    controllers: [MePartiesController],
    providers: [MyPartiesApplication],
})
export class MeModule {}
