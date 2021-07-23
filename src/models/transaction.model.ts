import {
    AllowNull,
    Column,
    CreatedAt,
    DataType,
    Default,
    DeletedAt,
    HasOne,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
} from 'sequelize-typescript';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { ITransaction } from 'src/entities/transaction.entity';
import { PartyMemberModel } from './party-member.model';

@Table({ tableName: 'transactions', paranoid: true })
export class TransactionModel
    extends Model<ITransaction, ITransaction>
    implements ITransaction
{
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @AllowNull(false)
    @Column(DataType.UUID)
    id?: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING, field: 'address_from' })
    addressFrom: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING, field: 'address_to' })
    addressTo: string;

    @AllowNull(false)
    @Column(DataType.BIGINT)
    amount: bigint;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER, field: 'currency_id' })
    currencyId: number;

    @AllowNull(false)
    @Column(
        DataType.ENUM(
            TransactionTypeEnum.Deposit,
            TransactionTypeEnum.Withdraw,
        ),
    )
    type: TransactionTypeEnum;

    @Column(DataType.TEXT)
    description?: string;

    @Column(DataType.STRING)
    signature: string;

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

    @HasOne(() => PartyMemberModel, 'depositTransactionId')
    depositedPartyMember?: PartyMemberModel;
}
