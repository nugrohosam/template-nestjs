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
    Injectable,
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
import { PartyValidation } from '../services/party.validation';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { GetTokenService } from '../services/token/get-token.service';
import { WSService } from 'src/modules/commons/providers/ws-service';

@Injectable()
export class CreatePartyApplication extends OnchainSeriesApplication {
    constructor(
        private readonly partyValidation: PartyValidation,
        private readonly web3Service: Web3Service,
        private readonly partyService: PartyService,
        private readonly getTokenService: GetTokenService,
        private readonly getPartyService: GetPartyService,
        private readonly wsService: WSService,
    ) {
        super();
        this.wsService.registerHandler(
            '0x758acae23e5cbf74ea7784d279d692222523adbb183849099d658f81f63c0a9d',
            (data) => {
                console.log('data', data);
            },
        );
    }

    async prepare(
        request: CreatePartyRequest,
    ): Promise<PrepareOnchainReturn<PartyModel>> {
        await this.partyValidation.validatePartyName(request.name);

        await this.web3Service.validateSignature(
            request.memberSignature,
            request.memberAddress,
            this.partyService.generateCreatePartySignatureMessage(request.name),
        );

        const creator = await this.partyValidation.validateCreatorAddress(
            request.memberAddress,
        );

        const party = await this.partyService.store({
            ...request,
            signature: request.memberSignature,
            creatorId: creator.id,
            ownerId: creator.id,
            totalFund: new BN(0),
            totalDeposit: new BN(0),
            totalMember: 0,
        });

        const platformSignature =
            await this.partyService.generatePlatformSignature(party, creator);

        return {
            data: party,
            platformSignature,
        };
    }

    @Transactional()
    async commit(
        partyId: string,
        request: UpdateDeployedPartyDataRequest,
    ): Promise<PartyModel> {
        let party = await this.getPartyService.getById(partyId);

        if (request.memberSignature !== party.signature)
            throw new UnauthorizedException('Invalid Signature');

        const creator = party.creator;
        await this.web3Service.validateTransaction(
            request.transactionHash,
            creator.address,
            CreatePartyEvent as AbiItem,
            { 2: party.id },
        );

        party = await this.partyService.update(party, {
            address: request.partyAddress,
            transactionHash: request.transactionHash,
        });

        // Base assets of party for now use USDC only
        const token = await this.getTokenService.getById(1);
        await this.partyService.storeToken(party, token, new BN(0));

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

        this.partyService.delete(party);
    }
}
