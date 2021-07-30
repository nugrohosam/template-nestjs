import {
    BelongsTo,
    Column,
    CreatedAt,
    DataType,
    Default,
    DeletedAt,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
} from 'sequelize-typescript';
import { useBigIntColumn } from 'src/common/utils/bigint-column.util';
import { IProposalVote } from 'src/entities/proposal-vote.entity';
import { PartyMemberModel } from './party-member.model';
import { Proposal } from './proposal.model';

@Table({ tableName: 'proposal_votes', paranoid: true })
export class ProposalVoteModel
    extends Model<IProposalVote, IProposalVote>
    implements IProposalVote
{
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id?: string;

    @ForeignKey(() => Proposal)
    @Column({ type: DataType.UUID, field: 'proposal_id' })
    proposalId: string;

    @ForeignKey(() => PartyMemberModel)
    @Column({ type: DataType.UUID, field: 'member_id' })
    memberId: string;

    @Column(useBigIntColumn(ProposalVoteModel, 'weight'))
    weight: bigint;

    @CreatedAt
    @Column({ type: DataType.DATE, field: 'created_at' })
    createdAt?: Date;

    @UpdatedAt
    @Column({ type: DataType.DATE, field: 'updated_at' })
    updatedAt?: Date;

    @DeletedAt
    @Column({ type: DataType.DATE, field: 'deleted_at' })
    deletedAt?: Date;

    @BelongsTo(() => Proposal, 'proposalId')
    proposal?: Proposal;

    @BelongsTo(() => PartyMemberModel, 'memberId')
    member?: PartyMemberModel;
}
