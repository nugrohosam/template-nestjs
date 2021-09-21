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
import { GetSignerService } from 'src/modules/commons/providers/get-signer.service';
import { IndexPartyResponse } from 'src/modules/parties/responses/index-party.response';
import { GetPartyService } from 'src/modules/parties/services/get-party.service';
import { TransactionResponse } from 'src/modules/transactions/responses/transaction.response';
import { DepositApplication } from '../applications/deposit.application';
import { MyPartiesApplication } from '../applications/my-parties.application';
import { WithdrawApplication } from '../applications/withdraw.application';
import { DepositRequest } from '../requests/deposit.request';
import { IndexMePartyRequest } from '../requests/index-party.request';
import { WithdrawRequest } from '../requests/withdraw.request';
import { WithdrawPreparationResponse } from '../responses/withdraw-preparation.response';

@Controller('me/parties')
export class MePartiesController {
    constructor(
        private readonly myPartyApplication: MyPartiesApplication,
        private readonly depositApplication: DepositApplication,
        private readonly withdrawApplication: WithdrawApplication,

        private readonly getSignerService: GetSignerService,
        private readonly getPartyService: GetPartyService,
    ) {}

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
}
