import {
    Injectable,
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

@Injectable()
export class JoinPartyApplication extends OnchainSeriesApplication {
    constructor(
        private readonly web3Service: Web3Service,
        private readonly partyMemberValidation: PartyMemberValidation,
        private readonly partyMemberService: PartyMemberService,
        private readonly transactionService: TransactionService,
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
        const member = partyMember.member ?? (await partyMember.getMember);

        console.log('MEMBER AT JOIN line 86 => ', member); // TODO: log

        if (request.joinPartySignature !== partyMember.signature)
            throw new UnauthorizedException('Signature not valid');

        if (partyMember.transactionHash) {
            const existingTransactionHash =
                await this.web3Service.getTransactionReceipt(
                    partyMember.transactionHash,
                );
            console.log(
                'existingTransactionHash AT JOIN line 97 => ',
                existingTransactionHash,
            ); // TODO: log
            if (existingTransactionHash.status) return;
        }

        const txh = this.web3Service.getTransaction(request.transactionHash);
        console.log('txh AT JOIN line 104 => ', txh); // TODO: log
        if (!txh) return partyMember;

        const transaction =
            await this.transactionService.storeDepositTransaction(
                partyMember,
                partyMember.initialFund,
                request.joinPartySignature,
                request.transactionHash,
            );
        console.log('txh AT JOIN line 114 => ', txh); // TODO: log

        partyMember = await this.partyMemberService.update(partyMember, {
            transactionHash: request.transactionHash,
            depositTransactionId: transaction.id,
        });

        const receipt = this.web3Service.getTransactionReceipt(
            request.transactionHash,
        );
        console.log('receipt AT JOIN line 121 => ', txh); // TODO: log
        if (!receipt) return partyMember;

        await this.web3Service.validateTransaction(
            request.transactionHash,
            member.address,
            PartyContract.getEventAbi(PartyEvents.JoinEvent),
            { 2: partyMember.id },
        );

        console.log('done validateTransaction web3 at LINE 127 => ', txh); // TODO: log

        await this.partyCalculationService.deposit(
            partyMember,
            transaction.amount,
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
