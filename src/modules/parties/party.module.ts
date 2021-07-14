import { Module } from '@nestjs/common';
import { Web3Module } from 'src/infrastructure/web3/web3.module';
import { TransactionModule } from '../transactions/transaction.module';
import { UserModule } from '../users/user.module';
import { PartyMemberController } from './controllers/party-member.controller';
import { PartyInvitationController } from './controllers/party-invitation.controller';
import { PartyController } from './controllers/party.controller';
import { AcceptInvitationService } from './services/invitation/accept-invitation.service';
import { CreatePartyService } from './services/create-party.service';
import { DeletePartyService } from './services/delete-party.service';
import { GetPartyService } from './services/get-party.service';
import { IndexPartyInvitationService } from './services/invitation/index-party-invitation.service';
import { IndexPartyMemberService } from './services/members/index-party-member.service';
import { IndexPartyService } from './services/index-party.service';
import { JoinPartyService } from './services/members/join-party.service';
import { UpdateTransactionHashService } from './services/update-transaction-hash.service';
import { UpdatePartyMemberService } from './services/members/update-party-member.service';
import { GetPartyMemberService } from './services/members/get-party-member.service';
import { InvitePartyService } from './services/invitation/invite-party.service';
import { JoinRequestController } from './controllers/join-request.controller';
import { RequestJoinService } from './services/join-request/request-join.service';
import { IndexJoinRequest } from './services/join-request/index-join-request.service';
import { UpdateStatusJoinRequestService } from './services/join-request/update-status-join-request.service';
import { GetJoinRequestService } from './services/join-request/get-join-request.service';
import { CommonModule } from '../commons/common.module';

@Module({
    imports: [Web3Module, UserModule, TransactionModule, CommonModule],
    controllers: [
        PartyController,
        JoinRequestController,
        PartyInvitationController,
        PartyMemberController,
    ],
    providers: [
        // Party Porviders
        IndexPartyService,
        GetPartyService,
        CreatePartyService,
        UpdateTransactionHashService,
        DeletePartyService,
        // Join Request Providers
        RequestJoinService,
        IndexJoinRequest,
        GetJoinRequestService,
        UpdateStatusJoinRequestService,
        // Party Invitation Providers
        InvitePartyService,
        IndexPartyInvitationService,
        AcceptInvitationService,
        // Party Member / Join Party Providers
        JoinPartyService,
        UpdatePartyMemberService,
        GetPartyMemberService,
        IndexPartyMemberService,
    ],
})
export class PartyModule {}
