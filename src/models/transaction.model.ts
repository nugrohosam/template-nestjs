import {
    AllowNull,
    Column,
    CreatedAt,
    DataType,
    Default,
    DeletedAt,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
} from 'sequelize-typescript';
import { ITransaction } from 'src/entities/transaction.entity';

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
    @Column(DataType.STRING)
    type: string;

    @Column(DataType.TEXT)
    description: string | null;

    @CreatedAt
    @Column({ type: DataType.DATE, field: 'created_at' })
    createdAt?: Date | null;

    @UpdatedAt
    @Column({ type: DataType.DATE, field: 'updated_at' })
    updatedAt?: Date | null;

    @DeletedAt
    @Column({ type: DataType.DATE, field: 'deleted_at' })
    deletedAt?: Date | null;
}
