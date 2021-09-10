import { UnprocessableEntityException } from '@nestjs/common';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { config } from 'src/config';
import { DepositEventAbi } from 'src/contracts/events';
import { OffchainApplication } from 'src/infrastructure/applications/offchain.application';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyModel } from 'src/models/party.model';
import { TransactionModel } from 'src/models/transaction.model';
import { UserModel } from 'src/models/user.model';
import { GetPartyMemberService } from 'src/modules/parties/services/members/get-party-member.service';
import { PartyCalculationService } from 'src/modules/parties/services/party-calculation.service';
import { TransactionService } from 'src/modules/transactions/services/transaction.service';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { DepositRequest } from '../requests/deposit.request';
import { MeService } from '../services/me.service';

export class DepositApplication extends OffchainApplication {
    constructor(
        private readonly web3Service: Web3Service,
        private readonly meService: MeService,
        private readonly transactionService: TransactionService,
        private readonly partyCalculationService: PartyCalculationService,
        private readonly getPartyMemberService: GetPartyMemberService,
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

        const cutAmount = this.partyCalculationService.getCutAmount(
            request.amount,
        );

        const depositTransaction = await this.transactionService.store({
            addressFrom: user.address,
            addressTo: party.address,
            type: TransactionTypeEnum.Deposit,
            currencyId: 1, // TODO: need to handle this for next feature (multi currencies)
            amount: request.amount.sub(cutAmount),
            description: `Deposit from ${user.address} to party ${party.address}`,
            signature: request.signature,
            transactionHash: request.transactionHash,
            transactionHashStatus: transactionStatus,
        });

        await this.transactionService.store({
            addressFrom: user.address,
            addressTo: config.platform.address,
            type: TransactionTypeEnum.Charge,
            currencyId: 1, // TODO: need to handle this for next feature (multi currencies)
            amount: cutAmount,
            description: `Charge of deposit transaction from ${user.address} to party ${party.address}`,
            signature: request.signature,
            transactionHash: request.transactionHash,
            transactionHashStatus: transactionStatus,
        });

        const partyMember = await this.getPartyMemberService.getByMemberParty(
            user.id,
            party.id,
        );
        await this.partyCalculationService.deposit(
            partyMember,
            depositTransaction.amount,
        );

        return depositTransaction;
    }
}
