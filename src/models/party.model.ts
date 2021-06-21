import {
    Column,
    CreatedAt,
    DataType,
    DeletedAt,
    Model,
    Table,
    UpdatedAt,
} from 'sequelize-typescript';
import {
    DistributionTypeEnum,
    PartyTypeEnum,
} from 'src/common/enums/party.enum';
import { IParty } from 'src/entities/party.entity';
import { UserModel } from './user.model';

@Table({ tableName: 'parties', paranoid: true })
export class PartyModel extends Model<IParty, IParty> implements IParty {
    @Column({
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        allowNull: false,
    })
    id?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    address?: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name: string;

    @Column({
        type: DataType.ENUM(
            PartyTypeEnum.Monarchy,
            PartyTypeEnum.Republic,
            PartyTypeEnum.Democracy,
            PartyTypeEnum.WeightedDemocracy,
        ),
        allowNull: false,
    })
    type: PartyTypeEnum;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    purpose: string;

    @Column({
        field: 'image_url',
        type: DataType.TEXT,
        allowNull: true,
    })
    imageUrl?: string;

    @Column({
        field: 'creator_id',
        type: DataType.UUID,
        allowNull: true,
    })
    creatorId: string;

    @Column({
        field: 'owner_id',
        type: DataType.UUID,
        allowNull: true,
    })
    ownerId: string;

    @Column({
        field: 'is_public',
        type: DataType.BOOLEAN,
        allowNull: false,
    })
    isPublic: boolean;

    @Column({
        field: 'total_fund',
        type: DataType.BIGINT,
        allowNull: false,
        defaultValue: 0,
    })
    totalFund?: number;

    @Column({
        field: 'min_deposit',
        type: DataType.BIGINT,
        allowNull: false,
        defaultValue: 0,
    })
    minDeposit?: number;

    @Column({
        field: 'max_deposit',
        type: DataType.BIGINT,
        allowNull: false,
        defaultValue: 0,
    })
    maxDeposit?: number;

    @Column({
        field: 'total_member',
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    })
    totalMember?: number;

    @Column({
        type: DataType.ENUM(
            DistributionTypeEnum.Daily,
            DistributionTypeEnum.Monthly,
            DistributionTypeEnum.Yearly,
        ),
        allowNull: false,
    })
    distribution: DistributionTypeEnum;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    signature: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    transactionHash?: string;

    @Column({
        field: 'created_at',
        allowNull: true,
        type: DataType.DATE,
    })
    @CreatedAt
    createdAt?: Date;

    @Column({
        field: 'updated_at',
        allowNull: true,
        type: DataType.DATE,
    })
    @UpdatedAt
    updatedAt?: Date;

    @Column({
        field: 'deleted_at',
        allowNull: true,
        type: DataType.DATE,
    })
    @DeletedAt
    deletedAt?: Date;

    static associate(): void {
        PartyModel.belongsTo(UserModel, {
            as: 'owner',
            foreignKey: 'ownerId',
            targetKey: 'id',
            onDelete: 'set null',
        });

        PartyModel.belongsTo(UserModel, {
            as: 'creator',
            foreignKey: 'creatorId',
            targetKey: 'id',
            onDelete: 'set null',
        });
    }
}
