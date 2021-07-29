import BN from 'bn.js';
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
import { IProposalDistribution } from 'src/entities/proposal-distribution.entity';
import { PartyMemberModel } from './party-member.model';
import { Proposal } from './proposal.model';

@Table({ tableName: 'proposal_distributions', paranoid: true })
export class ProposalDistributionModel
    extends Model<IProposalDistribution, IProposalDistribution>
    implements IProposalDistribution
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

    @Column(DataType.BIGINT)
    weight: BN;

    @Column(DataType.BIGINT)
    amount: BN;

    @Column({ type: DataType.STRING, field: 'transaction_hash' })
    transactionHash?: string;

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
