import { Module } from '@nestjs/common';
import { Web3Module } from 'src/infrastructure/web3/web3.module';
import { TransactionModule } from '../transactions/transaction.module';
import { UserModule } from '../users/user.module';
import { PartyMemberController } from './controllers/party-member.controller';
import { PartyController } from './controllers/party.controller';
import { PartyService } from './services/party.service';
import { GetPartyService } from './services/get-party.service';
import { PartyMemberService } from './services/members/party-member.service';
import { GetPartyMemberService } from './services/members/get-party-member.service';
import { PartyJoinRequestController } from './controllers/party-join-request.controller';
import { RequestJoinService } from './services/join-request/request-join.service';
import { IndexJoinRequestService } from './services/join-request/index-join-request.service';
import { UpdateStatusJoinRequestService } from './services/join-request/update-status-join-request.service';
import { GetJoinRequestService } from './services/join-request/get-join-request.service';
import { CommonModule } from '../commons/common.module';
import { JoinRequestController } from './controllers/join-request.controller';
import { PartyCalculationService } from './services/party-calculation.service';
import { CreateProposalService } from './services/proposal/create-proposal.service';
import { PartyProposalController } from './controllers/party-proposal.controller';
import { IndexProposalService } from './services/proposal/index-proposal.service';
import { GetProposalService } from './services/proposal/get-proposal.service';
import { ApproveProposalService } from './services/proposal/approve-proposal.service';
import { RejectProposalService } from './services/proposal/reject-proposal.service';
import { PartyTransactionController } from './controllers/party-transaction.controller';
import { CreatePartyApplication } from './applications/create-party.application';
import { IndexPartyApplication } from './applications/index-party.application';
import { JoinPartyApplication } from './applications/join-party.application';
import { IndexPartyMemberApplication } from './applications/index-party-member.application';
import { LeavePartyApplication } from './applications/leave-party.application';

@Module({
    imports: [Web3Module, UserModule, TransactionModule, CommonModule],
    controllers: [
        PartyController,
        PartyMemberController,
        PartyJoinRequestController,
        PartyProposalController,
        PartyTransactionController,

        JoinRequestController,
    ],
    providers: [
        // Party Porviders
        CreatePartyApplication,
        IndexPartyApplication,

        PartyService,
        GetPartyService,
        PartyCalculationService,

        // Join Request Providers
        RequestJoinService,
        IndexJoinRequestService,
        GetJoinRequestService,
        UpdateStatusJoinRequestService,

        // Party Member / Join Party Providers
        JoinPartyApplication,
        IndexPartyMemberApplication,
        LeavePartyApplication,

        PartyMemberService,
        GetPartyMemberService,

        // Proposal
        CreateProposalService,
        IndexProposalService,
        GetProposalService,
        ApproveProposalService,
        RejectProposalService,
    ],
    exports: [GetPartyService, GetPartyMemberService, PartyCalculationService],
})
export class PartyModule {}
