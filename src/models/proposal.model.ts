import BN from 'bn.js';
import { ProposalStatusEnum } from 'src/common/enums/party.enum';
import { IProposal } from 'src/entities/proposal.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { PartyModel } from './party.model';
import { ProposalDistributionModel } from './proposal-distribution.model';
import { ProposalVoteModel } from './proposal-vote.model';
import { UserModel } from './user.model';

@Entity({ name: 'proposals' })
export class Proposal implements IProposal {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column('uuid')
    partyId: string;

    @Column('varchar')
    title: string;

    @Column('text')
    description: string;

    @Column('varchar', { name: 'contract_address' })
    contractAddress: string;

    @Column('varchar', { name: 'attachment_url' })
    attachmentUrl: string;

    @Column('datetime', { name: 'vote_start' })
    voteStart: Date;

    @Column('datetime', { name: 'vote_end' })
    voteEnd: Date;

    @Column('datetime', { name: 'project_start' })
    projectStart: Date;

    @Column('datetime', { name: 'project_end' })
    projectEnd: Date;

    @Column('bigint')
    amount: BN;

    @Column('int', { name: 'currency_id' })
    currencyId: number;

    @Column('varchar', { name: 'creator_id' })
    creatorId: string;

    @Column('varchar')
    signature: string;

    @Column('varchar', { name: 'transaction_hash', nullable: true })
    transactionHash?: string;

    @Column('varchar', { name: 'approve_signature', nullable: true })
    approveSignature?: string;

    @Column('varchar', { name: 'approve_transaction_hash', nullable: true })
    approveTransactionHash?: string;

    @Column('timestamp', { name: 'approved_at', nullable: true })
    approvedAt?: Date;

    @Column('timestamp', { name: 'rejected_at', nullable: true })
    rejectedAt?: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;

    @ManyToOne(() => PartyModel, (party) => party.proposals)
    @JoinColumn({ name: 'party_id' })
    party?: Promise<PartyModel>;

    @ManyToOne(() => UserModel, (user) => user.proposals)
    @JoinColumn({ name: 'creator_id' })
    creator?: Promise<UserModel>;

    @OneToMany(() => ProposalVoteModel, (vote) => vote.proposal)
    votes?: Promise<ProposalVoteModel[]>;

    @OneToMany(
        () => ProposalDistributionModel,
        (distribution) => distribution.proposal,
    )
    distributions?: Promise<ProposalDistributionModel[]>;

    get status(): ProposalStatusEnum {
        if (this.approvedAt) {
            return ProposalStatusEnum.Approved;
        } else if (this.rejectedAt) {
            return ProposalStatusEnum.Rejected;
        } else {
            return ProposalStatusEnum.Pending;
        }
    }
}
