import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { DepositEventAbi } from 'src/contracts/events';
import { OffchainApplication } from 'src/infrastructure/applications/offchain.application';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyModel } from 'src/models/party.model';
import { TransactionModel } from 'src/models/transaction.model';
import { UserModel } from 'src/models/user.model';
import { GetPartyMemberService } from 'src/modules/parties/services/members/get-party-member.service';
import { PartyCalculationService } from 'src/modules/parties/services/party-calculation.service';
import { TokenService } from 'src/modules/parties/services/token/token.service';
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
        private readonly tokenService: TokenService,
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
            DepositEventAbi,
            {
                '0': user.address,
                '1': party.address,
                '2': request.amount.toString(),
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

        await this.partyCalculationService.deposit(
            partyMember,
            transaction.amount,
        );

        return transaction;
    }
}
