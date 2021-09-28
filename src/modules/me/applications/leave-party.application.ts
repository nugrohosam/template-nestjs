import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyTokenModel } from 'src/models/party-token.model';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { GetPartyMemberService } from 'src/modules/parties/services/members/get-party-member.service';
import { PartyMemberService } from 'src/modules/parties/services/members/party-member.service';
import { Repository } from 'typeorm';
import { LeavePartyRequest } from '../requests/leave.request';
import { LeavePreparationResponse } from '../responses/leave-preparation.response';
import { TokenService } from 'src/modules/parties/services/token/token.service';
import { ISwap0xResponse } from 'src/modules/parties/responses/swap-quote.response';
import { SwapQuoteService } from 'src/modules/parties/services/swap/swap-quote.service';
import { config } from 'src/config';
import { ILogParams } from 'src/modules/parties/types/logData';
import { MeService } from '../services/me.service';
import { TransactionService } from 'src/modules/transactions/services/transaction.service';
import { PartyCalculationService } from 'src/modules/parties/services/party-calculation.service';

@Injectable()
export class LeavePartyApplication {
    constructor(
        @InjectRepository(PartyTokenModel)
        private readonly partyTokenRepository: Repository<PartyTokenModel>,

        private readonly getPartyMemberService: GetPartyMemberService,

        private readonly web3Service: Web3Service,
        private readonly partyMemberService: PartyMemberService,
        private readonly tokenService: TokenService,
        private readonly swapQuoteService: SwapQuoteService,
        private readonly meService: MeService,
        private readonly transactionService: TransactionService,
        private readonly partyCalculationService: PartyCalculationService,
    ) {}

    async prepare(
        user: UserModel,
        party: PartyModel,
        request: LeavePartyRequest,
    ): Promise<LeavePreparationResponse> {
        const partyMember = await this.getPartyMemberService.getByMemberParty(
            user.id,
            party.id,
        );

        await this.web3Service.validateSignature(
            request.signature,
            user.address,
            this.partyMemberService.generateLeaveSignatureMessage(party),
        );

        const weight = partyMember.weight; // in wei percentage
        const tokens = await this.partyTokenRepository
            .createQueryBuilder('partyToken')
            .where('party_id = :partyId', { partyId: party.id })
            .getMany();

        const defaultToken = await this.tokenService.getDefaultToken();
        const results = await Promise.all(
            tokens.map(async (token) => {
                const balance = await this.tokenService.getTokenBalance(
                    party.address,
                    token.address,
                );
                const withdrawAmount = balance
                    .mul(weight)
                    .divn(config.calculation.maxPercentage);

                let swapResponse: ISwap0xResponse = null;
                if (token.address !== defaultToken.address) {
                    swapResponse = (
                        await this.swapQuoteService.getQuote(
                            defaultToken.address,
                            token.address,
                            withdrawAmount.toString(),
                        )
                    ).data;
                }

                return swapResponse;
            }),
        );

        const platformSignature =
            await this.partyMemberService.generateLeavePlatformSignature(
                user.address,
                weight,
            );

        return {
            weight: weight.toString(),
            swap: results.filter((result) => result !== null),
            platformSignature: platformSignature,
        };
    }

    async sync(logParams: ILogParams): Promise<void> {
        const { userAddress, partyAddress } =
            await this.meService.decodeLeaveEventData(logParams);

        let partyMember =
            await this.getPartyMemberService.getByUserAndPartyAddress(
                userAddress,
                partyAddress,
            );

        partyMember = await this.partyMemberService.update(partyMember, {
            leaveTransactionHash: logParams.result.transactionHash,
        });

        await this.partyMemberService.delete(partyMember, true);
    }
}
