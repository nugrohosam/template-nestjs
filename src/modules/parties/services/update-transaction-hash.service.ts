import {
    Inject,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyModel } from 'src/models/party.model';
import { UpdateDeployedPartyDataRequest } from '../requests/update-transaction-hash.request';
import { CreatePartyEvent } from 'src/contracts/CreatePartyEvent.json';
import { AbiItem } from 'web3-utils';

export class UpdateTransactionHashService {
    constructor(
        @Inject(Web3Service) private readonly web3Service: Web3Service,
    ) {}

    validateSignature(signature: string, party: PartyModel): void {
        if (signature !== party.signature)
            throw new UnauthorizedException('Signature not valid.');
    }

    async updateParty(
        partyId: string,
        request: UpdateDeployedPartyDataRequest,
    ): Promise<PartyModel> {
        const party = await PartyModel.findOne({
            where: { id: partyId },
        });
        if (!party) throw new NotFoundException('Party not found.');

        this.validateSignature(request.memberSignature, party);

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
}
