import { Inject, UnprocessableEntityException } from '@nestjs/common';
import { GetPartyService } from './get-party.service';

export class DeletePartyService {
    constructor(
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
    ) {}

    async delete(partyId: string): Promise<void> {
        const party = await this.getPartyService.getPartyById(partyId);

        if (party.transactionHash && party.address)
            throw new UnprocessableEntityException('Party active.');

        return await party.destroy();
    }
}
