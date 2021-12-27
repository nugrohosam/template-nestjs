import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { Utils } from 'src/common/utils/util';
import { PartyContract, PartyEvents } from 'src/contracts/Party';
import { OffchainApplication } from 'src/infrastructure/applications/offchain.application';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyModel } from 'src/models/party.model';
import { TransactionModel } from 'src/models/transaction.model';
import { UserModel } from 'src/models/user.model';
import { GetPartyMemberService } from 'src/modules/parties/services/members/get-party-member.service';
import { PartyCalculationService } from 'src/modules/parties/services/party-calculation.service';
import { TransactionVolumeService } from 'src/modules/transactions/services/transaction-volume.service';
import { TransactionService } from 'src/modules/transactions/services/transaction.service';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { DepositRequest } from '../requests/deposit.request';
import { MeService } from '../services/me.service';

@Injectable()
export class DepositApplication extends OffchainApplication {
    constructor(
        private readonly web3Service: Web3Service,
        private readonly meService: MeService,
        private readonly transactionService: TransactionService,
        private readonly partyCalculationService: PartyCalculationService,
        private readonly getPartyMemberService: GetPartyMemberService,
        private readonly transactionVolumeService: TransactionVolumeService,
    ) {
        super();
    }

    @Transactional()
    async call(
        user: UserModel,
        party: PartyModel,
        request: DepositRequest,
    ): Promise<TransactionModel> {
        await this.web3Service.validateSignature(
            request.signature,
            user.address,
            this.meService.generateDepositSignature(party.name, request.amount),
        );

        const transactionStatus = await this.web3Service.validateTransaction(
            request.transactionHash,
            user.address,
            PartyContract.getEventAbi(PartyEvents.DepositEvent),
            {
                0: user.address,
                1: party.address,
                2: request.amount.toString(),
            },
        );
        if (!transactionStatus)
            throw new UnprocessableEntityException('Transaction hash failed.');

        const partyMember = await this.getPartyMemberService.getByMemberParty(
            user.id,
            party.id,
        );

        const transaction =
            await this.transactionService.storeDepositTransaction(
                partyMember,
                request.amount,
                request.signature,
                request.transactionHash,
            );

        await this.transactionVolumeService.store({
            partyId: partyMember.partyId,
            type: TransactionTypeEnum.Deposit,
            transactionHash: request.transactionHash,
            amountUsd: Utils.getFromWeiToUsd(request.amount),
        });

        await this.partyCalculationService.deposit(
            partyMember,
            transaction.amount,
            request.transactionHash,
        );

        return transaction;
    }
}
