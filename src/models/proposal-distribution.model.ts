import BN from 'bn.js';
import { IProposalDistribution } from 'src/entities/proposal-distribution.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { PartyMemberModel } from './party-member.model';
import { ProposalModel } from './proposal.model';

@Entity({ name: 'proposal_distributions' })
export class ProposalDistributionModel implements IProposalDistribution {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column('uuid', { name: 'proposal_id' })
    proposalId: string;

    @Column('uuid', { name: 'member_id' })
    memberId: string;

    @Column('bigint')
    weight: BN;

    @Column('bigint')
    amount: BN;

    @Column('varchar', { name: 'transaction_hash' })
    transactionHash?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;

    @ManyToOne(() => ProposalModel, (proposal) => proposal.distributions, {
        eager: true,
    })
    @JoinColumn({ name: 'proposal_id' })
    proposal?: ProposalModel;

    @ManyToOne(
        () => PartyMemberModel,
        (partyMember) => partyMember.distributions,
        { eager: true },
    )
    @JoinColumn({ name: 'member_id' })
    member?: PartyMemberModel;
}
