import {
    Inject,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { JoinPartyRequest } from '../requests/member/join-party.request';
import { UpdatePartyMemberRequest } from '../requests/member/update-party-member.request';
import { PartyMemberService } from '../services/members/party-member.service';
import { JoinPartyEvent } from 'src/contracts/JoinPartyEvent.json';
import { AbiItem } from 'web3-utils';
import { TransactionService } from 'src/modules/transactions/services/transaction.service';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { PartyMemberValidationService } from '../services/members/party-member-validation.service';
import { PartyService } from '../services/party.service';
import { DeleteIncompleteDataRequest } from 'src/common/request/delete-incomplete-data.request';
import {
    OnchainSeriesApplication,
    PrepareOnchainReturn,
} from 'src/infrastructure/applications/onchain.application';

export class JoinPartyApplication extends OnchainSeriesApplication {
    constructor(
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
        @Inject(PartyMemberValidationService)
        private readonly partyMemberValidation: PartyMemberValidationService,
        @Inject(PartyMemberService)
        private readonly partyMemberService: PartyMemberService,
        @Inject(TransactionService)
        private readonly transactionService: TransactionService,
        @Inject(PartyService)
        private readonly partyService: PartyService,
    ) {
        super();
    }

    async prepare(
        party: PartyModel,
        user: UserModel,
        request: JoinPartyRequest,
    ): Promise<PrepareOnchainReturn<PartyMemberModel>> {
        await this.partyMemberValidation.validateUser(user, party);
        this.partyMemberValidation.validateUserInitialDeposit(
            party,
            request.initialDeposit,
        );

        const message = this.partyMemberService.generateJoinSignature(
            party,
            request.initialDeposit,
        );
        await this.web3Service.validateSignature(
            request.joinSignature,
            user.address,
            message,
        );

        const partyMember = await this.partyMemberService.store({
            partyId: party.id,
            memberId: user.id,
            initialFund: request.initialDeposit,
            totalFund: request.initialDeposit,
            totalDeposit: request.initialDeposit,
            signature: request.joinSignature,
        });

        const platformSignature =
            await this.partyMemberService.generatePlatformSignature(
                partyMember,
            );

        return {
            data: partyMember,
            platformSignature,
        };
    }

    async commit(
        partyMember: PartyMemberModel,
        request: UpdatePartyMemberRequest,
    ): Promise<PartyMemberModel> {
        const party = await partyMember.party;
        const member = await partyMember.member;

        if (request.joinPartySignature !== partyMember.signature)
            throw new UnauthorizedException('Signature not valid');

        await this.web3Service.validateTransaction(
            request.transactionHash,
            member.address,
            JoinPartyEvent as AbiItem,
            { 2: partyMember.id },
        );

        const transaction = await this.transactionService.store({
            addressFrom: member.address,
            addressTo: party.address,
            amount: partyMember.initialFund,
            currencyId: 1,
            type: TransactionTypeEnum.Deposit,
            signature: request.joinPartySignature,
            transactionHash: request.transactionHash,
            transactionHashStatus: true,
            description: 'Initial Deposit',
        });

        partyMember = await this.partyMemberService.update(partyMember, {
            transactionHash: request.transactionHash,
            depositTransactionId: transaction.id,
        });

        await this.partyService.updateParty(party, {
            totalFund: party.totalFund.add(transaction.amount),
            totalDeposit: party.totalDeposit.add(transaction.amount),
            totalMember: party.totalMember + 1,
        });

        return partyMember;
    }

    async revert(
        partyMember: PartyMemberModel,
        request: DeleteIncompleteDataRequest,
    ): Promise<void> {
        if (partyMember.signature !== request.signature)
            throw new UnauthorizedException('Signature not valid');

        if (partyMember.transactionHash)
            throw new UnprocessableEntityException(
                'Join party data already mark as complete data. Are you sure want to delete it?',
            );

        await this.partyMemberService.delete(partyMember);
    }
}
