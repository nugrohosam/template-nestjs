import BN from 'bn.js';
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
import { useBigIntColumn } from 'src/common/utils/bigint-column.util';
import { IPartyMember } from 'src/entities/party-member.entity';
import { PartyModel } from './party.model';
import { TransactionModel } from './transaction.model';
import { UserModel } from './user.model';

@Table({ tableName: 'party_members', paranoid: true })
export class PartyMemberModel
    extends Model<IPartyMember, IPartyMember>
    implements IPartyMember
{
    @PrimaryKey
    @AllowNull(false)
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id?: string;

    @ForeignKey(() => PartyModel)
    @AllowNull(false)
    @Column({ type: DataType.UUID, field: 'party_id' })
    partyId: string;

    @ForeignKey(() => UserModel)
    @AllowNull(false)
    @Column({ type: DataType.UUID, field: 'member_id' })
    memberId: string;

    @AllowNull(false)
    @Column(useBigIntColumn(PartyMemberModel, 'initialFund', 'initial_fund'))
    initialFund: BN;

    @AllowNull(false)
    @Column(useBigIntColumn(PartyMemberModel, 'totalFund', 'total_fund'))
    totalFund: BN;

    @AllowNull(false)
    @Column(useBigIntColumn(PartyMemberModel, 'totalDeposit', 'total_deposit'))
    totalDeposit: BN;

    @AllowNull(false)
    @Column(DataType.STRING)
    status: string; // TODO: use party member status enum instead

    @AllowNull(false)
    @Column(DataType.STRING)
    signature: string;

    @Column({ type: DataType.STRING, field: 'transaction_hash' })
    transactionHash?: string;

    @ForeignKey(() => TransactionModel)
    @Column({ type: DataType.UUID, field: 'transaction_id' })
    depositTransactionId?: string;

    @CreatedAt
    @Column({ type: DataType.DATE, field: 'created_at' })
    createdAt?: Date | null;

    @UpdatedAt
    @Column({ type: DataType.DATE, field: 'updated_at' })
    updatedAt?: Date | null;

    @DeletedAt
    @Column({ type: DataType.DATE, field: 'deleted_at' })
    deletedAt?: Date | null;

    @BelongsTo(() => PartyModel, 'partyId')
    readonly party?: PartyModel;

    @BelongsTo(() => UserModel, 'memberId')
    readonly member?: UserModel;

    @BelongsTo(() => TransactionModel, 'depositTransactionId')
    readonly depositTransaction?: TransactionModel;
}
