import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PartyModel } from 'src/models/party.model';
import { UpdateTransactionHashRequest } from '../requests/update-transaction-hash.request';

export class UpdateTransactionHashService {
    validateSignature(signature: string, party: PartyModel): void {
        if (signature !== party.signature)
            throw new UnauthorizedException('Signature not valid.');
    }

    // todo: need to cleared with sc for the event
    // validateTransactionHash(transactionHash: string): void {}

    async updateParty(
        partyId: string,
        request: UpdateTransactionHashRequest,
    ): Promise<PartyModel> {
        const party = await PartyModel.findOne({
            where: { id: partyId },
        });
        if (!party) throw new NotFoundException('Party not found.');

        this.validateSignature(request.memberSignature, party);
        // todo: need to cleared with sc for the event
        // this.validateTransactionHash(request.transactionHash);

        party.transactionHash = request.transactionHash;
        return await party.save();
    }
}
