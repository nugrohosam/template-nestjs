import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyTokenModel } from 'src/models/party-token.model';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { GetPartyMemberService } from 'src/modules/parties/services/members/get-party-member.service';
import { Repository } from 'typeorm';
import { WithdrawRequest } from '../requests/withdraw.request';
import { WithdrawPreparationResponse } from '../responses/withdraw-preparation.response';
import { MeService } from '../services/me.service';
import { SwapQuoteService } from 'src/modules/parties/services/swap/swap-quote.service';
import { TokenService } from 'src/modules/parties/services/token/token.service';
import { IPartyTokenBalance } from 'src/entities/party-token.entity';
import { ILogParams } from 'src/modules/parties/types/logData';
import { PartyCalculationService } from 'src/modules/parties/services/party-calculation.service';
import { Utils } from 'src/common/utils/util';
import { BN } from 'bn.js';
import { ISwap0xResponse } from 'src/modules/parties/responses/swap-quote.response';
import { TransactionService } from 'src/modules/transactions/services/transaction.service';
import { config } from 'src/config';

@Injectable()
export class WithdrawApplication {
    constructor(
        @InjectRepository(PartyTokenModel)
        private readonly partyTokenRepository: Repository<PartyTokenModel>,

        private readonly getPartyMemberService: GetPartyMemberService,

        private readonly meService: MeService,
        private readonly web3Service: Web3Service,
        private readonly tokenService: TokenService,
        private readonly swapQuoteService: SwapQuoteService,
        private readonly partyCalculationService: PartyCalculationService,
        private readonly transactionService: TransactionService,
    ) {}

    async prepare(
        user: UserModel,
        party: PartyModel,
        request: WithdrawRequest,
    ): Promise<WithdrawPreparationResponse> {
        const partyMember = await this.getPartyMemberService.getByMemberParty(
            user.id,
            party.id,
        );

        await this.web3Service.validateSignature(
            request.signature,
            user.address,
            this.meService.generateWithdrawSignature(
                party.name,
                request.percentage,
            ),
        );

        const weight = partyMember.weight; // in wei percentage
        const tokens = await this.partyTokenRepository
            .createQueryBuilder('partyToken')
            .where('party_id = :partyId', { partyId: party.id })
            .getMany();

        let totalWithdrawAmount = new BN(0); // in base token wei
        const defaultToken = await this.tokenService.getDefaultToken();
        const results = await Promise.all(
            tokens.map(async (token) => {
                const balance = await this.tokenService.getTokenBalance(
                    party.address,
                    token.address,
                );
                const withdrawAmount = balance
                    .mul(weight)
                    .divn(100 * config.calculation.percentageWei)
                    .muln(request.percentage * config.calculation.percentageWei)
                    .divn(100 * config.calculation.percentageWei);

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

                totalWithdrawAmount = totalWithdrawAmount.add(withdrawAmount);
                return {
                    tokens: {
                        ...token,
                        balance,
                    } as IPartyTokenBalance,
                    swap: swapResponse,
                };
            }),
        );

        const nextDistribution = Utils.dateOfNearestDay(
            new Date(),
            party.distributionDate
                ? new Date(party.distributionDate).getDay()
                : 1,
        );
        const distributionPass = Math.ceil(
            Utils.diffInDays(nextDistribution, new Date()),
        );

        const platformSignature =
            await this.meService.generateWithdrawPlatformSignature(
                party.address,
                totalWithdrawAmount,
                distributionPass,
            );

        return {
            weight: weight.toString(),
            amount: totalWithdrawAmount.toString(),
            tokens: results.map((result) => result.tokens),
            swaps: results
                .filter((result) => !!!result)
                .map((result) => result.swap),
            distributionPass,
            platformSignature,
        };
    }

    async sync(logParams: ILogParams): Promise<void> {
        const { userAddress, partyAddress, amount, cut, penalty } =
            await this.meService.decodeWithdrawEventData(logParams);

        // dummy signature for fill transaction data only. not depend on anything.
        const signature = this.meService.generateWithdrawSignature(
            partyAddress,
            amount.toNumber(),
        );
        await this.transactionService.storeWithdrawTransaction(
            userAddress,
            partyAddress,
            amount,
            cut,
            penalty,
            signature,
            logParams.result.transactionHash,
        );

        await this.partyCalculationService.withdraw(
            partyAddress,
            userAddress,
            amount,
        );
    }
}
