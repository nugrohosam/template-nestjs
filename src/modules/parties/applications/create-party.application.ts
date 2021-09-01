/**
 * Handling On Chain Transaction with flow
 * FE -> BE -> FE -> SC -> FE -> BE
 * - Preparing data first without transaction hash recorded
 *   and send platform signature to be used by SC to validate
 *   incoming data
 * - After FE get transaction hash, it will be sended to BE 2x
 *   (transaction hash initiated & transaction hash success / fail)
 * - When success BE will commit draft data with transaction hash sended
 * - When fail (with any condition) FE will request to revert data
 */
import {
    Inject,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { BN } from 'bn.js';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyModel } from 'src/models/party.model';
import { CreatePartyRequest } from '../requests/create-party.request';
import { UpdateDeployedPartyDataRequest } from '../requests/update-transaction-hash.request';
import { PartyService } from '../services/party.service';
import { GetPartyService } from '../services/get-party.service';
import { CreatePartyEvent } from 'src/contracts/CreatePartyEvent.json';
import { AbiItem } from 'web3-utils';
import { RevertCreatePartyRequest } from '../requests/revert-create-party.request';
import {
    OnchainSeriesApplication,
    PrepareOnchainReturn,
} from 'src/infrastructure/applications/onchain.application';

export class CreatePartyApplication extends OnchainSeriesApplication {
    constructor(
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
        @Inject(PartyService)
        private readonly partyService: PartyService,
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
    ) {
        super();
    }

    async prepare(
        request: CreatePartyRequest,
    ): Promise<PrepareOnchainReturn<PartyModel>> {
        await this.web3Service.validateSignature(
            request.memberSignature,
            request.memberAddress,
            this.partyService.generateCreatePartySignatureMessage(request.name),
        );

        const creator = await this.partyService.validateCreatorAddress(
            request.memberAddress,
        );

        const party = await this.partyService.storeParty({
            ...request,
            signature: request.memberSignature,
            creatorId: creator.id,
            ownerId: creator.id,
            totalFund: new BN(0),
            totalMember: 0,
        });

        const platformSignature =
            await this.partyService.generatePlatformSignature(party, creator);

        return {
            data: party,
            platformSignature,
        };
    }

    async commit(
        partyId: string,
        request: UpdateDeployedPartyDataRequest,
    ): Promise<PartyModel> {
        const party = await this.getPartyService.getById(partyId);

        if (request.memberSignature !== party.signature)
            throw new UnauthorizedException('Invalid Signature');

        const creator = party.creator;
        await this.web3Service.validateTransaction(
            request.transactionHash,
            creator.address,
            CreatePartyEvent as AbiItem,
            { 2: party.id },
        );

        this.partyService.updateParty(party, {
            address: request.partyAddress,
            transactionHash: request.transactionHash,
        });

        return null;
    }

    async revert(request: RevertCreatePartyRequest): Promise<void> {
        const party = await this.getPartyService.getByTransactionHash(
            request.transactionHash,
        );
        if (request.signature !== party.signature)
            throw new UnauthorizedException('Invalid Signature');

        const transactionReceipt = await this.web3Service.getTransactionReceipt(
            request.transactionHash,
        );
        if (transactionReceipt.status)
            throw new UnprocessableEntityException(
                'This party has a success transaction hash.',
            );

        this.partyService.deleteParty(party);
    }
}
