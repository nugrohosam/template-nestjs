import {
    Inject,
    NotFoundException,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyModel } from 'src/models/party.model';
import { UpdateTransactionHashRequest } from '../requests/update-transaction-hash.request';

export class UpdateTransactionHashService {
    constructor(
        @Inject(Web3Service) private readonly web3Service: Web3Service,
    ) {}

    validateSignature(signature: string, party: PartyModel): void {
        if (signature !== party.signature)
            throw new UnauthorizedException('Signature not valid.');
    }

    async validateTransactionHash(transactionHash: string): Promise<void> {
        const transaction = await this.web3Service.getTransaction(
            transactionHash,
        );

        if (!transaction)
            throw new UnprocessableEntityException(
                'Transaction not found in Network.',
            );
    }

    async updateParty(
        partyId: string,
        request: UpdateTransactionHashRequest,
    ): Promise<PartyModel> {
        const party = await PartyModel.findOne({
            where: { id: partyId },
        });
        if (!party) throw new NotFoundException('Party not found.');

        this.validateSignature(request.memberSignature, party);
        await this.validateTransactionHash(request.transactionHash);
        // TODO: validate log event check the transactionHash is belongs to party data

        party.transactionHash = request.transactionHash;
        return await party.save();
    }
}
