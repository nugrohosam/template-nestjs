import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Web3Module } from 'src/infrastructure/web3/web3.module';
import { PartyTokenModel } from 'src/models/party-token.model';
import { PartyModel } from 'src/models/party.model';
import { CommonModule } from '../commons/common.module';
import { PartyModule } from '../parties/party.module';
import { TransactionModule } from '../transactions/transaction.module';
import { ClosePartyApplication } from './applications/close-party.application';
import { DepositApplication } from './applications/deposit.application';
import { LeavePartyApplication } from './applications/leave-party.application';
import { MyPartiesApplication } from './applications/my-parties.application';
import { WithdrawAllApplication } from './applications/withdraw-all.application';
import { WithdrawApplication } from './applications/withdraw.application';
import { MePartiesController } from './controllers/parties.controller';
import { MeService } from './services/me.service';

@Module({
    imports: [
        CommonModule,
        Web3Module,
        PartyModule,
        TransactionModule,
        TypeOrmModule.forFeature([PartyModel, PartyTokenModel]),
    ],
    controllers: [MePartiesController],
    providers: [
        MyPartiesApplication,
        DepositApplication,
        WithdrawApplication,
        LeavePartyApplication,
        ClosePartyApplication,
        WithdrawApplication,
        WithdrawAllApplication,

        MeService,
    ],
    exports: [
        WithdrawAllApplication,
        WithdrawApplication,
        LeavePartyApplication,
        ClosePartyApplication,
    ],
})
export class MeModule {}
