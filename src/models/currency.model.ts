import {
    AllowNull,
    AutoIncrement,
    Column,
    CreatedAt,
    DataType,
    DeletedAt,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
} from 'sequelize-typescript';
import { ICurrency } from 'src/entities/currency.entity';

@Table({ tableName: 'currencies', paranoid: true })
export class CurrencyModel
    extends Model<ICurrency, ICurrency>
    implements ICurrency
{
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id?: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    symbol: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    address: string;

    @Column(DataType.TEXT)
    description?: string;

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