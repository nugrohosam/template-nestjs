import { Injectable } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyMemberModel } from 'src/models/party-member.model';
import { LeavePartyRequest } from '../requests/member/leave-party.request';
import { PartyMemberService } from '../services/members/party-member.service';
import { LeavePartyEvent } from 'src/contracts/LeavePartyEvent';
import { TransactionService } from 'src/modules/transactions/services/transaction.service';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { PartyCalculationService } from '../services/party-calculation.service';
import { PartyService } from '../services/party.service';
import { OnchainParalelApplication } from 'src/infrastructure/applications/onchain.application';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { GetPartyService } from '../services/get-party.service';
import { GetUserService } from 'src/modules/users/services/get-user.service';

@Injectable()
export class LeavePartyApplication extends OnchainParalelApplication {
    constructor(
        private readonly web3Service: Web3Service,
        private readonly partyMemberService: PartyMemberService,
        private readonly transactionService: TransactionService,
        private readonly partyCalculationService: PartyCalculationService,
        private readonly partyService: PartyService,
        private readonly getPartyService: GetPartyService,
        private readonly getUserService: GetUserService,
    ) {
        super();
    }

    @Transactional()
    async commit(
        partyMember: PartyMemberModel,
        request: LeavePartyRequest,
    ): Promise<void> {
        const party = await this.getPartyService.getById(partyMember.partyId);
        const user = await this.getUserService.getUserById(
            partyMember.memberId,
        );

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
            LeavePartyEvent.abi,
            { 0: user.address },
        );

        partyMember = await this.partyMemberService.update(partyMember, {
            leaveTransactionHash: request.transactionHash,
        });

        // will only process leave party bussiness logic if transaction hash
        // sended by FE is the success one (true)
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
    }

    async revert(partyMember: PartyMemberModel): Promise<void> {
        // TODO: validate request
        await this.partyMemberService.update(partyMember, {
            leaveTransactionHash: null,
        });
    }
}
