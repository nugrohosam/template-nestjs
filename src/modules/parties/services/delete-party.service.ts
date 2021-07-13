import {
    Inject,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { PartyModel } from 'src/models/party.model';
import { DeletePartyRequest } from '../requests/delete-party.request';
import { GetPartyService } from './get-party.service';

export class DeletePartyService {
    constructor(
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
    ) {}

    validateSignature(signature: string, party: PartyModel): void {
        if (signature !== party.signature)
            throw new UnauthorizedException('Signature not valid.');
    }

    async delete(partyId: string, request: DeletePartyRequest): Promise<void> {
        const party = await this.getPartyService.getById(partyId);

        this.validateSignature(request.memberSignature, party);

        if (party.transactionHash && party.address)
            throw new UnprocessableEntityException('Party active.');

        return await party.destroy();
    }
}
