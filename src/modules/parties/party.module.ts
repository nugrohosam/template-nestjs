import { Module } from '@nestjs/common';
import { Web3Module } from 'src/infrastructure/web3/web3.module';
import { TransactionModule } from '../transactions/transaction.module';
import { UserModule } from '../users/user.module';
import { PartyInvitationController } from './controllers/party-invitation.controller';
import { PartyController } from './controllers/party.controller';
import { CreatePartyService } from './services/create-party.service';
import { GetPartyService } from './services/get-party.service';
import { IndexPartyService } from './services/index-party.service';
import { InvitePartyService } from './services/invite-party.service';
import { JoinPartyService } from './services/join-party.service';
import { UpdateTransactionHashService } from './services/update-transaction-hash.service';

@Module({
    imports: [Web3Module, UserModule, TransactionModule],
    controllers: [PartyController, PartyInvitationController],
    providers: [
        IndexPartyService,
        GetPartyService,
        CreatePartyService,
        UpdateTransactionHashService,
        JoinPartyService,
        InvitePartyService,
    ],
})
export class PartyModule {}
