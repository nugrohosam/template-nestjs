import {
    Inject,
    NotFoundException,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { CreatePartyRequest } from '../requests/create-party.request';
import { config } from 'src/config';
import BN from 'bn.js';
import { CreatePartyEvent } from 'src/contracts/CreatePartyEvent.json';
import { AbiItem } from 'web3-utils';
import { UpdateDeployedPartyDataRequest } from '../requests/update-transaction-hash.request';
import { GetPartyService } from './get-party.service';
import { RevertCreatePartyRequest } from '../requests/revert-create-party.request';

/**
 * Here is a create party flow :
 * - FE will call BE (create) to prepare new party data and get the partyId and platformSignature (generatePlatformSignature)
 * - FE will call SC with response from BE (partyId, platformSignature) alongside with user's input
 * - FE will call BE (updateTransactionHash) when got the transactionHash twice.
 *   - When transactionHash created but the actual transaction not finished yet in network
 *   - When transaction in network finish with any status (true, false)
 * - When SC has throw error, FE will call BE (revertTransaction) to revert the incomplete create party transaction
 */
export class CreatePartyService {
    constructor(
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
    ) {}

    private generateCreatePartySignatureMessage({
        name,
    }: CreatePartyRequest): string {
        return `I want to create party with name ${name}`;
    }

    private async validateCreatePartySignature(
        request: CreatePartyRequest,
    ): Promise<string> {
        const message = this.generateCreatePartySignatureMessage(request);
        // TODO: need to removed after testing
        console.log('message[create-party]: ' + message);
        const signer = await this.web3Service.recover(
            request.memberSignature,
            message,
        );

        if (signer !== request.memberAddress)
            throw new UnprocessableEntityException('Signature not valid.');

        return signer;
    }

    private async validateCreatorAddress(address: string): Promise<UserModel> {
        const creator = await UserModel.findOne({
            where: { address: address },
        });

        if (!creator)
            throw new UnprocessableEntityException('User not registered.');

        return creator;
    }

    /**
     * Create a party that is not complete yet. The partyId that generated
     * here will be sended to SC so we can synchronize the party data in
     * SC and BE. This party data created will complete when have address
     * and transaction hash from SC.
     */
    async create(request: CreatePartyRequest): Promise<PartyModel> {
        const creatorAddress = await this.validateCreatePartySignature(request);
        const creator = await this.validateCreatorAddress(creatorAddress);

        const party = await PartyModel.create({
            ...request,
            signature: request.memberSignature,
            creatorId: creator.id,
            ownerId: creator.id,
            totalFund: new BN(0),
            totalMember: 0,
        });

        return party;
    }

    /**
     * A platform signature used to verify the partyId
     * sended to SC is the real one that created from BE
     * after create party
     */
    async generatePlatformSignature(
        party: PartyModel,
        creator: UserModel,
    ): Promise<string> {
        const platformAddress = config.platform.address;
        const message = this.web3Service.soliditySha3([
            { t: 'string', v: party.id },
            { t: 'address', v: creator.address },
            { t: 'address', v: platformAddress },
            { t: 'string', v: creator.id },
            { t: 'bool', v: party.isPublic ? 1 : 0 },
        ]);
        // TODO: need to removed after testing
        console.log('message[platform-create-party]: ' + message);
        return await this.web3Service.sign(message);
    }

    /**
     * Update created party transaction hash and will make
     * the party marked as a complete data and ready to
     * interact with
     */
    async updateTransacionHash(
        partyId: string,
        request: UpdateDeployedPartyDataRequest,
    ): Promise<PartyModel> {
        const party = await this.getPartyService.getById(partyId);

        if (request.memberSignature !== party.signature)
            throw new UnauthorizedException('Invalid Signature');

        const creator = await party.$get('creator');
        await this.web3Service.validateTransaction(
            request.transactionHash,
            creator.address,
            CreatePartyEvent as AbiItem,
            { 2: party.id },
        );

        party.address = request.partyAddress;
        party.transactionHash = request.transactionHash;
        return await party.save();
    }

    /**
     * Revert the incomplete transaction when there is an error
     * while dealing with SC. So we will don't have any incomplete data
     */
    async revertTransaction({
        signature,
        transactionHash,
    }: RevertCreatePartyRequest): Promise<void> {
        const party = await PartyModel.findOne({
            where: { transactionHash },
        });
        if (!party)
            throw new NotFoundException(
                'Party with given transaction hash not found.',
            );

        if (signature !== party.signature)
            throw new UnauthorizedException('Invalid Signature');

        const transactionReceipt = await this.web3Service.getTransactionReceipt(
            transactionHash,
        );
        if (transactionReceipt.status)
            throw new UnprocessableEntityException(
                'This party has a success transaction hash.',
            );

        await party.destroy({ force: true });
    }
}
