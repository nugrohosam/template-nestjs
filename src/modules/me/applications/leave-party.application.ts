import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
import { Utils } from 'src/common/utils/util';
import { JoinRequestService } from 'src/modules/parties/services/join-request/join-request.service';
import { TransactionService } from 'src/modules/transactions/services/transaction.service';
import { PartyCalculationService } from 'src/modules/parties/services/party-calculation.service';
import { TransactionSyncService } from 'src/modules/transactions/services/transaction-sync.service';
import { PartyEvents } from 'src/contracts/Party';
import BN from 'bn.js';
import { TransactionVolumeService } from 'src/modules/transactions/services/transaction-volume.service';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';

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
        private readonly joinRequestService: JoinRequestService,
        private readonly transactionService: TransactionService,
        private readonly partyCalculationService: PartyCalculationService,
        private readonly transactionSyncService: TransactionSyncService,
        private readonly transactionVolumeService: TransactionVolumeService,
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
                let withdrawAmount = new BN(0);
                if (
                    (typeof weight === 'number' && weight !== 0) ||
                    (typeof weight === 'object' && !weight.isZero())
                ) {
                    withdrawAmount = balance
                        .mul(weight)
                        .divn(config.calculation.maxPercentage);
                }

                let swapResponse: ISwap0xResponse = null;
                if (
                    token.address !== defaultToken.address &&
                    !balance.isZero()
                ) {
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

                return swapResponse;
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
            await this.partyMemberService.generateLeavePlatformSignature(
                user.address,
                weight,
            );

        return {
            weight: weight.toString(),
            swap: results.filter((result) => result !== null),
            distributionPass,
            platformSignature: platformSignature,
        };
    }

    async sync(logParams: ILogParams): Promise<void> {
        try {
            const {
                userAddress,
                partyAddress,
                amount,
                cut,
                penalty,
                percentage,
            } = await this.meService.decodeLeaveEventData(
                logParams.result.transactionHash,
            );

            let partyMember =
                await this.getPartyMemberService.getByUserAndPartyAddress(
                    userAddress,
                    partyAddress,
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
                percentage,
            );

            partyMember = await this.partyMemberService.update(partyMember, {
                leaveTransactionHash: logParams.result.transactionHash,
            });

            await Promise.all([
                this.partyMemberService.delete(partyMember),
                this.joinRequestService.deleteJoinRequest(
                    partyMember.memberId,
                    partyMember.partyId,
                ),
                this.transactionVolumeService.store({
                    partyId: partyMember.partyId,
                    type: TransactionTypeEnum.Withdraw,
                    transactionHash: logParams.result.transactionHash,
                    amountUsd: Utils.getFromWeiToUsd(amount),
                }),
            ]);
            Logger.debug('<= Leave Party End sync ');
        } catch (error) {
            // save to log for retrial
            await this.transactionSyncService.store({
                transactionHash: logParams.result.transactionHash,
                eventName: PartyEvents.LeavePartyEvent,
                isSync: false,
            });
            Logger.error('[LEAVE-PARTY-NOT-SYNC]', error);
        }
    }

    async retrySync(transactionHash: string): Promise<void> {
        try {
            const {
                userAddress,
                partyAddress,
                amount,
                cut,
                penalty,
                percentage,
            } = await this.meService.decodeLeaveEventData(transactionHash);

            let partyMember =
                await this.getPartyMemberService.getByUserAndPartyAddress(
                    userAddress,
                    partyAddress,
                );

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
                percentage,
            );

            partyMember = await this.partyMemberService.update(partyMember, {
                leaveTransactionHash: transactionHash,
            });

            await Promise.all([
                this.partyMemberService.delete(partyMember),
                this.joinRequestService.deleteJoinRequest(
                    partyMember.memberId,
                    partyMember.partyId,
                ),
                this.transactionVolumeService.store({
                    partyId: partyMember.partyId,
                    type: TransactionTypeEnum.Withdraw,
                    transactionHash: transactionHash,
                    amountUsd: Utils.getFromWeiToUsd(amount),
                }),
            ]);

            await this.transactionSyncService.updateStatusSync(
                transactionHash,
                true,
            );

            Logger.debug('<= Retry Leave Party End sync ');
        } catch (error) {
            // save to log for retrial
            Logger.error(
                `[RETRY-LEAVE-PARTY-NOT-SYNC]  => ${transactionHash} || error =>`,
                error,
            );
        }
    }
}
