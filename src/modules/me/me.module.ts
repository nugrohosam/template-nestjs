import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Web3Module } from 'src/infrastructure/web3/web3.module';
import { PartyModel } from 'src/models/party.model';
import { CommonModule } from '../commons/common.module';
import { PartyModule } from '../parties/party.module';
import { TransactionModule } from '../transactions/transaction.module';
import { DepositApplication } from './applications/deposit.application';
import { MyPartiesApplication } from './applications/my-parties.application';
import { MePartiesController } from './controllers/parties.controller';
import { MeService } from './services/me.service';

@Module({
    imports: [
        CommonModule,
        Web3Module,
        PartyModule,
        TransactionModule,
        TypeOrmModule.forFeature([PartyModel]),
    ],
    controllers: [MePartiesController],
    providers: [MyPartiesApplication, DepositApplication, MeService],
})
export class MeModule {}
