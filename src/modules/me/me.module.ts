import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartyModel } from 'src/models/party.model';
import { CommonModule } from '../commons/common.module';
import { PartyModule } from '../parties/party.module';
import { DepositApplication } from './applications/deposit.application';
import { MyPartiesApplication } from './applications/my-parties.application';
import { MePartiesController } from './controllers/parties.controller';

@Module({
    imports: [
        CommonModule,
        PartyModule,
        TypeOrmModule.forFeature([PartyModel]),
    ],
    controllers: [MePartiesController],
    providers: [MyPartiesApplication, DepositApplication],
})
export class MeModule {}
