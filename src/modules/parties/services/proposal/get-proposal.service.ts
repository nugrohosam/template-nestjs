import { Injectable, NotFoundException } from '@nestjs/common';
import { Proposal } from 'src/models/proposal.model';

@Injectable()
export class GetProposalService {
    async getById(id: string): Promise<Proposal> {
        const proposal = Proposal.findOne({ where: { id } });
        if (!proposal) throw new NotFoundException('Proposal not found.');
        return proposal;
    }
}
