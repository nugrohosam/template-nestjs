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
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartyModel } from 'src/models/party.model';
import { PartyMemberModel } from 'src/models/party-member.model';
import { JoinRequestModel } from 'src/models/join-request.model';
import { ProposalDistributionModel } from 'src/models/proposal-distribution.model';
import { ProposalModel } from 'src/models/proposal.model';
import { IndexPartyTransactionApplication } from './applications/index-party-transaction.application';
import { TransactionModel } from 'src/models/transaction.model';
import { IndexJoinRequestApplication } from './applications/index-join-request.application';
import { HttpModule } from '@nestjs/axios';
import { SwapController } from './controllers/swap.controller';
import { SwapQuoteApplication } from './applications/swap-quote.application';
import { PartyValidation } from './services/party.validation';
import { PartyTokenModel } from 'src/models/party-token.model';
import { PartyGainModel } from 'src/models/party-gain.model';
import { TokenService } from './services/token/token.service';
import { CurrencyModel } from 'src/models/currency.model';
import { SwapSignatureSerivce } from './services/swap/swap-signature.service';
import { SwapQuoteService } from './services/swap/swap-quote.service';
import { PartyTokenController } from './controllers/party-token.controller';
import { IndexPartyTokenApplication } from './applications/index-party-token.application';
import { IndexPartyGainApplication } from './applications/index-party-gain.application';
import { PartyGainController } from './controllers/party-gain.controller';
import { WSService } from '../commons/providers/ws-service';
import { SwapFeeService } from './services/swap/swap-fee.service';
import { SwapTransactionModel } from 'src/models/swap-transaction.model';
import { PartyGainService } from './services/party-gain/party-gain.service';
import { GetTokenPriceService } from './services/token/get-token-price.service';
import { GetTokenBalanceService } from './utils/get-token-balance.util';
@Module({
    imports: [
        HttpModule,
        WSService,
        Web3Module,
        UserModule,
        TransactionModule,
        CommonModule,
        TypeOrmModule.forFeature([
            PartyModel,
            CurrencyModel,
            PartyMemberModel,
            JoinRequestModel,
            ProposalModel,
            ProposalDistributionModel,
            TransactionModel,
            PartyTokenModel,
            PartyGainModel,
            SwapTransactionModel,
        ]),
    ],
    controllers: [
        PartyController,
        PartyMemberController,
        PartyJoinRequestController,
        PartyTransactionController,
        SwapController,
        JoinRequestController,
        PartyTokenController,
        PartyGainController,
    ],
    providers: [
        // Party Porviders
        CreatePartyApplication,
        IndexPartyApplication,

        PartyValidation,
        PartyService,
        GetPartyService,
        PartyCalculationService,

        // Party Tokens
        TokenService,

        // Join Request Providers
        RequestJoinPartyApplication,
        UpdateJoinRequestStatusApplication,
        IndexPartyJoinRequestApplication,
        IndexJoinRequestApplication,

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

        // Transaction
        IndexPartyTransactionApplication,

        // Swap
        SwapQuoteApplication,
        SwapSignatureSerivce,
        SwapQuoteService,
        SwapFeeService,

        // Token
        IndexPartyTokenApplication,

        // Gain
        IndexPartyGainApplication,
        PartyGainService,
        GetTokenPriceService,
        GetTokenBalanceService,
    ],
    exports: [
        GetPartyService,
        GetPartyMemberService,

        PartyService,
        PartyMemberService,
        PartyCalculationService,
        TokenService,
        SwapQuoteService,
        SwapSignatureSerivce,
    ],
})
export class PartyModule {}
