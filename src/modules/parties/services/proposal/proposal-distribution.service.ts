import { InjectRepository } from '@nestjs/typeorm';
import { IProposalDistribution } from 'src/entities/proposal-distribution.entity';
import { ProposalDistributionModel } from 'src/models/proposal-distribution.model';
import { Repository } from 'typeorm';

export class ProposalDistributionService {
    constructor(
        @InjectRepository(ProposalDistributionModel)
        private readonly repository: Repository<ProposalDistributionModel>,
    ) {}

    async store(
        data: IProposalDistribution,
    ): Promise<ProposalDistributionModel> {
        const proposalDistribution = this.repository.create(data);
        return await this.repository.save(proposalDistribution);
    }

    async update(
        proposalDistribution: ProposalDistributionModel,
        data: Partial<IProposalDistribution>,
    ): Promise<ProposalDistributionModel> {
        proposalDistribution = Object.assign(proposalDistribution, data);
        return await this.repository.save(proposalDistribution);
    }
}
