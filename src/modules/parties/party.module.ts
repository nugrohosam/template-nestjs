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
import { JoinRequestService } from './services/join-request/join-request.service';
import { GetJoinRequestService } from './services/join-request/get-join-request.service';
import { CommonModule } from '../commons/common.module';
import { JoinRequestController } from './controllers/join-request.controller';
import { PartyCalculationService } from './services/party-calculation.service';
import { ProposalService } from './services/proposal/proposal.service';
import { PartyProposalController } from './controllers/party-proposal.controller';
import { GetProposalService } from './services/proposal/get-proposal.service';
import { PartyTransactionController } from './controllers/party-transaction.controller';
import { CreatePartyApplication } from './applications/create-party.application';
import { IndexPartyApplication } from './applications/index-party.application';
import { JoinPartyApplication } from './applications/join-party.application';
import { IndexPartyMemberApplication } from './applications/index-party-member.application';
import { LeavePartyApplication } from './applications/leave-party.application';
import { RequestJoinPartyApplication } from './applications/request-join-party.application';
import { IndexPartyJoinRequestApplication } from './applications/index-party-join-request.application';
import { UpdateJoinRequestStatusApplication } from './applications/update-join-request-status.application';
import { JoinRequestValidation } from './services/join-request/join-request.validation';
import { PartyMemberValidation } from './services/members/party-member.validation';
import { CreateProposalApplication } from './applications/create-proposal.application';
import { IndexPartyProposalApplication } from './applications/index-party-proposal.application';
import { ApproveProposalApplication } from './applications/approve-proposal-application';
import { RejectProposalApplication } from './applications/reject-proposal.application';

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
        RequestJoinPartyApplication,
        IndexPartyJoinRequestApplication,
        UpdateJoinRequestStatusApplication,

        JoinRequestService,
        GetJoinRequestService,

        JoinRequestValidation,

        // Party Member / Join Party Providers
        JoinPartyApplication,
        IndexPartyMemberApplication,
        LeavePartyApplication,

        PartyMemberService,
        GetPartyMemberService,

        PartyMemberValidation,

        // Proposal
        CreateProposalApplication,
        IndexPartyProposalApplication,
        ApproveProposalApplication,
        RejectProposalApplication,

        ProposalService,
        GetProposalService,
    ],
    exports: [GetPartyService, GetPartyMemberService, PartyCalculationService],
})
export class PartyModule {}
