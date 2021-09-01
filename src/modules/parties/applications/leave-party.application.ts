import { Inject } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyMemberModel } from 'src/models/party-member.model';
import { LeavePartyRequest } from '../requests/member/leave-party.request';
import { PartyMemberService } from '../services/members/party-member.service';
import { LeavePartyEvent } from 'src/contracts/LeavePartyEvent.json';
import { AbiItem } from 'web3-utils';
import { TransactionService } from 'src/modules/transactions/services/transaction.service';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { PartyCalculationService } from '../services/party-calculation.service';
import { PartyService } from '../services/party.service';
import { OnchainParalelApplication } from 'src/infrastructure/applications/onchain.application';

export class LeavePartyApplication extends OnchainParalelApplication {
    constructor(
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
        @Inject(PartyMemberService)
        private readonly partyMemberService: PartyMemberService,
        @Inject(TransactionService)
        private readonly transactionService: TransactionService,
        @Inject(PartyCalculationService)
        private readonly partyCalculationService: PartyCalculationService,
        @Inject(PartyService)
        private readonly partyService: PartyService,
    ) {
        super();
    }

    async commit(
        partyMember: PartyMemberModel,
        request: LeavePartyRequest,
    ): Promise<void> {
        const party = await partyMember.party;
        const user = await partyMember.member;

        const message =
            this.partyMemberService.generateLeaveSignatureMessage(party);
        await this.web3Service.validateSignature(
            request.signature,
            user.address,
            message,
        );

        const transactionStatus = await this.web3Service.validateTransaction(
            request.transactionHash,
            user.address,
            LeavePartyEvent as AbiItem,
            { 0: user.address },
        );

        partyMember = await this.partyMemberService.update(partyMember, {
            leaveTransactionHash: request.transactionHash,
        });

        if (!transactionStatus) return;

        const transaction = await this.transactionService.store({
            addressFrom: party.address,
            addressTo: user.address,
            type: TransactionTypeEnum.Withdraw,
            amount: partyMember.totalFund.neg(),
            currencyId: 1,
            signature: request.signature,
            transactionHash: request.transactionHash,
            transactionHashStatus: transactionStatus,
            description: 'Leave Withdraw',
        });

        await this.partyCalculationService.withdraw(
            party.address,
            user.address,
            transaction.amount,
        );

        await this.partyMemberService.delete(partyMember, true);

        await this.partyService.updateParty(party, {
            totalMember: party.totalMember - 1,
        });
    }

    async revert(partyMember: PartyMemberModel): Promise<void> {
        // TODO: validate request
        await this.partyMemberService.update(partyMember, {
            leaveTransactionHash: null,
        });
    }
}
