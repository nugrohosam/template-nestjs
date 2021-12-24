import {
    Injectable,
    Logger,
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
import { TransactionService } from 'src/modules/transactions/services/transaction.service';
import { PartyMemberValidation } from '../services/members/party-member.validation';
import { DeleteIncompleteDataRequest } from 'src/common/request/delete-incomplete-data.request';
import {
    OnchainSeriesApplication,
    PrepareOnchainReturn,
} from 'src/infrastructure/applications/onchain.application';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { PartyCalculationService } from '../services/party-calculation.service';
import BN from 'bn.js';
import { PartyContract, PartyEvents } from 'src/contracts/Party';
import { GetTransactionService } from 'src/modules/transactions/services/get-transaction.service';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';

@Injectable()
export class JoinPartyApplication extends OnchainSeriesApplication {
    constructor(
        private readonly web3Service: Web3Service,
        private readonly partyMemberValidation: PartyMemberValidation,
        private readonly partyMemberService: PartyMemberService,
        private readonly transactionService: TransactionService,
        private readonly getTransactionService: GetTransactionService,
        private readonly partyCalculationService: PartyCalculationService,
    ) {
        super();
    }

    @Transactional()
    async prepare(
        party: PartyModel,
        user: UserModel,
        request: JoinPartyRequest,
    ): Promise<PrepareOnchainReturn<PartyMemberModel>> {
        await this.partyMemberValidation.validateUser(user, party);
        this.partyMemberValidation.validateDepositAmount(
            request.initialDeposit,
            party,
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
            totalFund: new BN(0),
            totalDeposit: new BN(0),
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

    @Transactional()
    async commit(
        partyMember: PartyMemberModel,
        request: UpdatePartyMemberRequest,
    ): Promise<PartyMemberModel> {
        Logger.debug(request.transactionHash, 'Init commit Join Party');
        const member = partyMember.member ?? (await partyMember.getMember);

        if (request.joinPartySignature !== partyMember.signature) {
            Logger.debug(
                'request.joinPartySignature !== partyMember.signature',
            );
            throw new UnauthorizedException('Signature not valid');
        }

        if (partyMember.transactionHash) {
            Logger.debug('partyMember.transactionHash');
            const existingTransactionHash =
                await this.web3Service.getTransactionReceipt(
                    partyMember.transactionHash,
                );
            if (existingTransactionHash.status) return;
        }

        const txh = await this.web3Service.getTransaction(
            request.transactionHash,
        );
        if (!txh) return partyMember;
        Logger.debug('!thx passed');

        // need to check if transactionHash exists
        let transaction = await this.getTransactionService.getByTx(
            request.transactionHash,
            TransactionTypeEnum.Deposit,
        );

        if (!transaction) {
            Logger.debug('!transaction');
            transaction = await this.transactionService.storeDepositTransaction(
                partyMember,
                partyMember.initialFund,
                request.joinPartySignature,
                request.transactionHash,
            );

            partyMember = await this.partyMemberService.update(partyMember, {
                transactionHash: request.transactionHash,
                depositTransactionId: transaction.id,
            });
            Logger.debug('!partyMember updated depositTransactionId');
        }
        Logger.debug('!transaction passed');

        const receipt = this.web3Service.getTransactionReceipt(
            request.transactionHash,
        );
        if (!receipt) return partyMember;

        await this.web3Service.validateTransaction(
            request.transactionHash,
            member.address,
            PartyContract.getEventAbi(PartyEvents.JoinEvent),
            { 2: partyMember.id },
        );

        await this.partyCalculationService.deposit(
            partyMember,
            transaction.amount,
            request.transactionHash,
        );
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
