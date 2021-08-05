import {
    Inject,
    Injectable,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { Transaction } from 'sequelize/types';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyModel } from 'src/models/party.model';
import { Proposal } from 'src/models/proposal.model';
import { UserModel } from 'src/models/user.model';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { AbiItem } from 'web3-utils';
import { CreateProposalRequest } from '../../requests/proposal/create-proposal.request';
import { UpdateProposalTransactionRequest } from '../../requests/proposal/update-proposal-transaction.request';
import { GetPartyService } from '../get-party.service';
import { GetProposalService } from './get-proposal.service';
import { CreateProposalEvents } from 'src/contracts/CreateProposalEvent.json';

@Injectable()
export class CreateProposalService {
    constructor(
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
        @Inject(GetUserService)
        private readonly getUserService: GetUserService,
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
        @Inject(GetProposalService)
        private readonly getProposalService: GetProposalService,
    ) {}

    private generateSignatureMessage(
        party: PartyModel,
        request: CreateProposalRequest,
    ): string {
        return `I want to create a proposal in ${party.name} with title ${request.title}`;
    }

    private async validateUserIsPartyMember(
        user: UserModel,
        party: PartyModel,
    ): Promise<void> {
        const members = await party.$get('members', {
            where: { id: user.id },
        });
        if (members.length <= 0)
            throw new UnprocessableEntityException(
                'User is not a party member',
            );
    }

    private validateProposalAmount(
        party: PartyModel,
        { amount }: CreateProposalRequest,
    ): void {
        if (amount.gt(party.totalFund))
            throw new UnprocessableEntityException(
                'Proposal amount exceed curent party fund',
            );
    }

    async store(
        party: PartyModel,
        request: CreateProposalRequest,
        user: UserModel,
        t?: Transaction,
    ): Promise<Proposal> {
        return await Proposal.create(
            {
                partyId: party.id,
                ...request,
                creatorId: user.id,
            },
            { transaction: t },
        );
    }

    async call(
        partyId: string,
        request: CreateProposalRequest,
    ): Promise<Proposal> {
        const party = await this.getPartyService.getById(partyId);
        const user = await this.getUserService.getUserByAddress(
            request.signerAddress,
        );

        const message = this.generateSignatureMessage(party, request);
        // TODO: need to removed after testing
        console.log('message[create-proposal]: ' + message);
        await this.web3Service.validateSignature(
            request.signature,
            request.signerAddress,
            message,
        );

        await this.validateUserIsPartyMember(user, party);
        this.validateProposalAmount(party, request);

        return this.store(party, request, user);
    }

    async generatePlatformSignature(proposal: Proposal): Promise<string> {
        const party = await proposal.$get('party');
        const message = this.web3Service.soliditySha3([
            { t: 'string', v: party.id },
            { t: 'address', v: party.address },
            { t: 'string', v: proposal.id },
        ]);

        console.log('message[create-proposal]: ' + message);
        return this.web3Service.sign(message);
    }

    async updateTransactionHash(
        proposalId: string,
        request: UpdateProposalTransactionRequest,
    ): Promise<Proposal> {
        const proposal = await this.getProposalService.getById(proposalId);

        if (request.signature !== proposal.signature)
            throw new UnauthorizedException('Invalid Signature');

        const signer = await proposal.$get('creator');
        await this.web3Service.validateTransaction(
            request.transactionHash,
            signer.address,
            CreateProposalEvents as AbiItem,
            { 0: proposal.id },
        );

        proposal.transactionHash = request.transactionHash;
        return await proposal.save();
    }

    async revert(
        proposalId: string,
        request: UpdateProposalTransactionRequest,
    ): Promise<void> {
        const proposal = await this.getProposalService.getById(proposalId);

        if (request.signature !== proposal.signature)
            throw new UnauthorizedException('Invalid Signature');

        proposal.transactionHash = null;
        await proposal.save();
    }
}
