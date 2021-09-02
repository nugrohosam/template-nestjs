import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProposalModel } from 'src/models/proposal.model';
import { Repository } from 'typeorm';

@Injectable()
export class GetProposalService {
    constructor(
        @InjectRepository(ProposalModel)
        private readonly repository: Repository<ProposalModel>,
    ) {}

    async getById(proposalId: string): Promise<ProposalModel> {
        const query = this.repository.createQueryBuilder('proposals');
        query.where('id = :id', { id: proposalId });

        const proposal = await query.getOne();

        if (!proposal) throw new NotFoundException('Proposal not found.');
        return proposal;
    }
}
