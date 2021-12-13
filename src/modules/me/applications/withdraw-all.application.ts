import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyTokenModel } from 'src/models/party-token.model';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { GetPartyMemberService } from 'src/modules/parties/services/members/get-party-member.service';
import { Repository } from 'typeorm';
import { WithdrawAllRequest } from '../requests/withdraw.request';
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
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { PartyMemberService } from 'src/modules/parties/services/members/party-member.service';
import { JoinRequestService } from 'src/modules/parties/services/join-request/join-request.service';
import { TransactionSyncService } from 'src/modules/transactions/services/transaction-sync.service';
import { PartyEvents } from 'src/contracts/Party';

@Injectable()
export class WithdrawAllApplication {
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
        private readonly partyMemberService: PartyMemberService,
        private readonly joinRequestService: JoinRequestService,
        private readonly transactionSyncService: TransactionSyncService,
    ) {}

    async prepare(
        user: UserModel,
        party: PartyModel,
        request: WithdrawAllRequest,
    ): Promise<WithdrawPreparationResponse> {
        const withdrawAllPercentage = 100;
        const partyMember = await this.getPartyMemberService.getByMemberParty(
            user.id,
            party.id,
        );

        await this.web3Service.validateSignature(
            request.signature,
            user.address,
            this.meService.generateWithdrawAllSignature(party.name),
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
                    .divn(config.calculation.maxPercentage)
                    .muln(
                        withdrawAllPercentage *
                            config.calculation.percentageWei,
                    )
                    .divn(config.calculation.maxPercentage);

                let swapResponse: ISwap0xResponse;
                if (token.address !== defaultToken.address) {
                    const { data, err } = await this.swapQuoteService.getQuote(
                        defaultToken.address,
                        token.address,
                        withdrawAmount.toString(),
                    );
                    if (err) {
                        throw new BadRequestException(
                            err.response.data.validationErrors[0].reason,
                        );
                    }
                    swapResponse = data.data;
                }

                totalWithdrawAmount = totalWithdrawAmount.add(
                    swapResponse
                        ? new BN(swapResponse.buyAmount)
                        : withdrawAmount,
                );
                return {
                    tokens: {
                        ...token,
                        balance: balance.toString(),
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
            swap: results
                .map((result) => result.swap)
                .filter((result) => result !== undefined),
            distributionPass,
            platformSignature,
        };
    }

    @Transactional()
    async sync(logParams: ILogParams): Promise<void> {
        try {
            const { userAddress, partyAddress, amount, cut, penalty } =
                await this.meService.decodeWithdrawEventData(
                    logParams.result.transactionHash,
                );
            await this.transactionService.storeWithdrawTransaction(
                userAddress,
                partyAddress,
                amount,
                cut,
                penalty,
                null,
                logParams.result.transactionHash,
            );

            await this.partyCalculationService.withdraw(
                partyAddress,
                userAddress,
                amount,
            );

            // leaver party
            const partyMember =
                await this.getPartyMemberService.getByUserAndPartyAddress(
                    userAddress,
                    partyAddress,
                );

            await Promise.all([
                this.partyMemberService.delete(partyMember),
                this.joinRequestService.deleteJoinRequest(
                    partyMember.memberId,
                    partyMember.partyId,
                ),
            ]);
        } catch (error) {
            // save to log for retrial
            await this.transactionSyncService.store({
                transactionHash: logParams.result.transactionHash,
                eventName: PartyEvents.WithdrawAllEvent,
                isSync: false,
            });
            Logger.error('[WITHDRAW-ALL-NOT-SYNC]', error);
        }
    }

    @Transactional()
    async retrySync(transactionHash: string): Promise<void> {
        try {
            const { userAddress, partyAddress, amount, cut, penalty } =
                await this.meService.decodeWithdrawEventData(transactionHash);
            await this.transactionService.storeWithdrawTransaction(
                userAddress,
                partyAddress,
                amount,
                cut,
                penalty,
                null,
                transactionHash,
            );

            await this.partyCalculationService.withdraw(
                partyAddress,
                userAddress,
                amount,
            );

            // leaver party
            const partyMember =
                await this.getPartyMemberService.getByUserAndPartyAddress(
                    userAddress,
                    partyAddress,
                );

            await Promise.all([
                this.partyMemberService.delete(partyMember),
                this.joinRequestService.deleteJoinRequest(
                    partyMember.memberId,
                    partyMember.partyId,
                ),
            ]);

            await this.transactionSyncService.updateStatusSync(
                transactionHash,
                true,
            );
        } catch (error) {
            // skip retry and will be delegated to next execution
            Logger.error('[RETRY-WITHDRAW-ALL-NOT-SYNC]', error);
        }
    }
}
