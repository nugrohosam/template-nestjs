import BN from 'bn.js';
import { IProposalVote } from 'src/entities/proposal-vote.entity';
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
import { Proposal } from './proposal.model';

@Entity({ name: 'proposal_votes' })
export class ProposalVoteModel implements IProposalVote {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column('uuid', { name: 'proposal_id' })
    proposalId: string;

    @Column('uuid', { name: 'member_id' })
    memberId: string;

    @Column('bigint')
    weight: BN;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;

    @ManyToOne(() => Proposal, (proposal) => proposal.votes)
    @JoinColumn({ name: 'proposal_id' })
    proposal?: Proposal;

    @ManyToOne(() => PartyMemberModel, (partyMember) => partyMember.votes)
    @JoinColumn({ name: 'member_id' })
    member?: PartyMemberModel;
}
