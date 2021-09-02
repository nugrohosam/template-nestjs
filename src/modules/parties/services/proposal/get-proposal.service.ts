import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Proposal } from 'src/models/proposal.model';
import { Repository } from 'typeorm';

@Injectable()
export class GetProposalService {
    constructor(
        @InjectRepository(Proposal)
        private readonly repository: Repository<Proposal>,
    ) {}

    async getById(proposalId: string): Promise<Proposal> {
        const query = this.repository.createQueryBuilder('proposals');
        query.where('id = :id', { id: proposalId });

        const proposal = await query.getOne();

        if (!proposal) throw new NotFoundException('Proposal not found.');
        return proposal;
    }
}
