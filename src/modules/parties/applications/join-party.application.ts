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
import { JoinPartyEvent } from 'src/contracts/JoinPartyEvent.json';
import { AbiItem } from 'web3-utils';
import { TransactionService } from 'src/modules/transactions/services/transaction.service';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { PartyMemberValidation } from '../services/members/party-member.validation';
import { PartyService } from '../services/party.service';
import { DeleteIncompleteDataRequest } from 'src/common/request/delete-incomplete-data.request';
import {
    OnchainSeriesApplication,
    PrepareOnchainReturn,
} from 'src/infrastructure/applications/onchain.application';
import { BN } from 'bn.js';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { GetTokenService } from '../services/token/get-token.service';
import { GetPartyService } from '../services/get-party.service';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { PartyCalculationService } from '../services/party-calculation.service';
import { config } from 'src/config';

@Injectable()
export class JoinPartyApplication extends OnchainSeriesApplication {
    private readonly WeiPercentage = 10 ** 4;

    constructor(
        private readonly web3Service: Web3Service,
        private readonly partyMemberValidation: PartyMemberValidation,
        private readonly partyMemberService: PartyMemberService,
        private readonly transactionService: TransactionService,
        private readonly partyService: PartyService,
        private readonly getTokenService: GetTokenService,
        private readonly getPartyService: GetPartyService,
        private readonly getUserService: GetUserService,
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

    @Transactional()
    async commit(
        partyMember: PartyMemberModel,
        request: UpdatePartyMemberRequest,
    ): Promise<PartyMemberModel> {
        let party =
            partyMember.party ??
            (await this.getPartyService.getById(partyMember.partyId));
        const member =
            partyMember.member ??
            (await this.getUserService.getUserById(partyMember.memberId));

        if (request.joinPartySignature !== partyMember.signature)
            throw new UnauthorizedException('Signature not valid');

        const transactionStatus = await this.web3Service.validateTransaction(
            request.transactionHash,
            member.address,
            JoinPartyEvent as AbiItem,
            { 2: partyMember.id },
        );
        if (!transactionStatus) return; // will ignore below process when transaction still false

        const token = await this.getTokenService.getDefaultToken();
        const cutAmount = this.partyCalculationService.getCutAmount(
            partyMember.initialFund,
        );
        const transaction = await this.transactionService.store({
            addressFrom: member.address,
            addressTo: party.address,
            amount: partyMember.initialFund.sub(cutAmount),
            currencyId: token.id,
            type: TransactionTypeEnum.Deposit,
            signature: request.joinPartySignature,
            transactionHash: request.transactionHash,
            transactionHashStatus: true,
            description: 'Initial Deposit',
        });
        await this.transactionService.store({
            addressFrom: member.address,
            addressTo: config.platform.address,
            type: TransactionTypeEnum.Charge,
            currencyId: token.id,
            amount: cutAmount,
            description: `Charge of deposit transaction from ${member.address} to party ${party.address}`,
            signature: request.joinPartySignature,
            transactionHash: request.transactionHash,
            transactionHashStatus: true,
        });

        partyMember = await this.partyMemberService.update(partyMember, {
            transactionHash: request.transactionHash,
            depositTransactionId: transaction.id,
        });

        party = await this.partyService.update(party, {
            totalFund: party.totalFund.add(transaction.amount),
            totalDeposit: party.totalDeposit.add(transaction.amount),
            totalMember: party.totalMember + 1,
        });

        partyMember = await this.partyMemberService.update(partyMember, {
            weight: partyMember.totalDeposit
                .mul(new BN(this.WeiPercentage))
                .div(party.totalDeposit),
        });

        await this.partyService.storeToken(party, token, transaction.amount);

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
