import {
    AllowNull,
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
import { ProposalStatusEnum } from 'src/common/enums/party.enum';
import { IProposal } from 'src/entities/proposal.entity';
import { PartyModel } from './party.model';
import { UserModel } from './user.model';

@Table({ tableName: 'proposals', paranoid: true })
export class Proposal extends Model<IProposal, IProposal> implements IProposal {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id?: string;

    @ForeignKey(() => PartyModel)
    @Column({ type: DataType.UUID, field: 'party_id' })
    partyId: string;

    @Column(DataType.STRING)
    title: string;

    @Column(DataType.TEXT)
    description: string;

    @Column({ type: DataType.STRING, field: 'contract_address' })
    contractAddress: string;

    @Column({ type: DataType.STRING, field: 'attachment_url' })
    attachmentUrl: string;

    @Column({ type: DataType.DATE, field: 'vote_start' })
    voteStart: Date;

    @Column({ type: DataType.DATE, field: 'vote_end' })
    voteEnd: Date;

    @Column({ type: DataType.DATE, field: 'project_start' })
    projectStart: Date;

    @Column({ type: DataType.DATE, field: 'project_end' })
    projectEnd: Date;

    @Column(DataType.BIGINT)
    amount: bigint;

    @Column({ type: DataType.INTEGER, field: 'currency_id' })
    currencyId: number;

    @ForeignKey(() => UserModel)
    @Column({ type: DataType.UUID, field: 'creator_id' })
    creatorId: string;

    @Column(DataType.STRING)
    signature: string;

    @AllowNull(true)
    @Column({ type: DataType.STRING, field: 'transaction_hash' })
    transactionHash?: string;

    @AllowNull(true)
    @Column({ type: DataType.DATE, field: 'approved_at' })
    approvedAt?: Date;

    @AllowNull(true)
    @Column({ type: DataType.DATE, field: 'rejected_at' })
    rejectedAt?: Date;

    @CreatedAt
    @Column({ type: DataType.DATE, field: 'created_at' })
    createdAt: Date;

    @UpdatedAt
    @Column({ type: DataType.DATE, field: 'updated_at' })
    updatedAt: Date;

    @DeletedAt
    @Column({ type: DataType.DATE, field: 'deleted_at' })
    deletedAt: Date;

    @BelongsTo(() => PartyModel, 'partyId')
    party?: PartyModel;

    @BelongsTo(() => UserModel, 'creatorId')
    creator?: UserModel;

    @Column({ type: DataType.VIRTUAL })
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
