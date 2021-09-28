import {
    Body,
    Controller,
    Get,
    Headers,
    Param,
    Post,
    Query,
} from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { PartyContract, PartyEvents } from 'src/contracts/Party';
import { GetSignerService } from 'src/modules/commons/providers/get-signer.service';
import { WSService } from 'src/modules/commons/providers/ws-service';
import { IndexPartyResponse } from 'src/modules/parties/responses/index-party.response';
import { GetPartyService } from 'src/modules/parties/services/get-party.service';
import { ILogParams } from 'src/modules/parties/types/logData';
import { TransactionResponse } from 'src/modules/transactions/responses/transaction.response';
import { ClosePartyApplication } from '../applications/close-party.application';
import { DepositApplication } from '../applications/deposit.application';
import { LeavePartyApplication } from '../applications/leave-party.application';
import { MyPartiesApplication } from '../applications/my-parties.application';
import { WithdrawApplication } from '../applications/withdraw.application';
import { DepositRequest } from '../requests/deposit.request';
import { IndexMePartyRequest } from '../requests/index-party.request';
import { LeavePartyRequest } from '../requests/leave.request';
import { WithdrawRequest } from '../requests/withdraw.request';
import { ClosePreparationResponse } from '../responses/close-preparation.response';
import { LeavePreparationResponse } from '../responses/leave-preparation.response';
import { WithdrawPreparationResponse } from '../responses/withdraw-preparation.response';

@Controller('me/parties')
export class MePartiesController {
    constructor(
        private readonly myPartyApplication: MyPartiesApplication,
        private readonly depositApplication: DepositApplication,
        private readonly withdrawApplication: WithdrawApplication,
        private readonly leavePartyApplication: LeavePartyApplication,
        private readonly closePartyApplication: ClosePartyApplication,

        private readonly getSignerService: GetSignerService,
        private readonly getPartyService: GetPartyService,
        private readonly wsService: WSService,
    ) {
        this.wsService.registerHandler(
            PartyContract.getEventSignature(PartyEvents.WithdrawEvent),
            async (logParams: ILogParams) => {
                await this.withdrawApplication.sync(logParams);
            },
        );

        this.wsService.registerHandler(
            PartyContract.getEventSignature(PartyEvents.LeavePartyEvent),
            async (logParams: ILogParams) => {
                await this.leavePartyApplication.sync(logParams);
            },
        );

        this.wsService.registerHandler(
            PartyContract.getEventSignature(PartyEvents.ClosePartyEvent),
            async (logParams: ILogParams) => {
                await this.closePartyApplication.sync(logParams);
            },
        );
    }

    @Get()
    async index(
        @Headers('Signature') signature: string,
        @Query() query: IndexMePartyRequest,
    ): Promise<IApiResponse<IndexPartyResponse[]>> {
        const { data, meta } = await this.myPartyApplication.fetch(
            query,
            signature,
        );

        const response = data.map((datum) => {
            return IndexPartyResponse.mapFromPartyModel(datum);
        });

        return {
            message: 'Success fetch user parties',
            data: response,
            meta,
        };
    }

    @Post(':partyId/deposit')
    async deposit(
        @Headers('Signature') signature: string,
        @Param('partyId') partyId: string,
        @Body() request: DepositRequest,
    ): Promise<IApiResponse<TransactionResponse>> {
        const user = await this.getSignerService.get(signature, true);
        const party = await this.getPartyService.getById(partyId);

        const depositTransaction = await this.depositApplication.call(
            user,
            party,
            request,
        );

        return {
            message: 'Success deposit to party',
            data: TransactionResponse.mapFromTransactionModel(
                depositTransaction,
            ),
        };
    }

    @Post(':partyId/withdraw')
    async withdraw(
        @Headers('Signature') signature: string,
        @Param('partyId') partyId: string,
        @Body() request: WithdrawRequest,
    ): Promise<IApiResponse<WithdrawPreparationResponse>> {
        const user = await this.getSignerService.get(signature, true);
        const party = await this.getPartyService.getById(partyId);

        const withdrawPreparation = await this.withdrawApplication.prepare(
            user,
            party,
            request,
        );

        return {
            message: 'Success get withdraw preparation data',
            data: withdrawPreparation,
        };
    }

    @Post(':partyId/leave')
    async leave(
        @Headers('Signature') signature: string,
        @Param('partyId') partyId: string,
        @Body() request: LeavePartyRequest,
    ): Promise<IApiResponse<LeavePreparationResponse>> {
        const user = await this.getSignerService.get(signature);
        const party = await this.getPartyService.getById(partyId);
        const leavePreparation = await this.leavePartyApplication.prepare(
            user,
            party,
            request,
        );
        return {
            message: 'Success get leave prepareation data',
            data: leavePreparation,
        };
    }

    @Post(':partyId/close')
    async close(
        @Headers('Signature') signature: string,
        @Param('partyId') partyId: string,
        @Body() request: LeavePartyRequest,
    ): Promise<IApiResponse<ClosePreparationResponse>> {
        const user = await this.getSignerService.get(signature);
        const party = await this.getPartyService.getById(partyId);

        const result = await this.closePartyApplication.prepare(
            user,
            party,
            request,
        );
        return {
            message: 'Success get close preparation data',
            data: result,
        };
    }
}
