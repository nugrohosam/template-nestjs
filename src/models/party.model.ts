import {
    BelongsTo,
    BelongsToMany,
    Column,
    CreatedAt,
    DataType,
    DeletedAt,
    ForeignKey,
    HasMany,
    Model,
    Table,
    UpdatedAt,
} from 'sequelize-typescript';
import {
    DistributionTypeEnum,
    PartyTypeEnum,
} from 'src/common/enums/party.enum';
import { IParty } from 'src/entities/party.entity';
import { PartyInvitationModel } from './party-invitation.model';
import { PartyMemberModel } from './party-member.model';
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
    @ForeignKey(() => UserModel)
    creatorId: string;

    @Column({
        field: 'owner_id',
        type: DataType.UUID,
        allowNull: true,
    })
    @ForeignKey(() => UserModel)
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

    @BelongsTo(() => UserModel, 'ownerId')
    readonly owner?: UserModel;

    @BelongsTo(() => UserModel, 'creatorId')
    readonly creator?: UserModel;

    @BelongsToMany(
        () => UserModel,
        () => PartyMemberModel,
        'partyId',
        'memberId',
    )
    readonly members?: PartyMemberModel[];

    @HasMany(() => PartyInvitationModel)
    readonly invitations?: PartyInvitationModel[];

    /**
     * TODO: need to confirm to PO about distribution schedule
     * get next distribution schedule based on created date
     * and distribution type
     */
    get nextDistributionOn(): Date | null {
        return this.createdAt;

        // switch (this.distribution) {
        //     case DistributionTypeEnum.Daily:
        //         date =
        //             date.getHours() > new Date().getHours()
        //                 ? new Date(date.setDate(new Date().getDate() + 1))
        //                 : new Date(new Date().setTime(date.getTime()));
        //         break;
        //     case DistributionTypeEnum.Monthly:
        //         date =
        //             date.getDate() > new Date().getDate()
        //                 ? new Date(date.setMonth(new Date().getMonth() + 1))
        //                 : new Date(new Date().setTime(date.getTime()));
        //         break;
        //     case DistributionTypeEnum.Yearly:
        //         date =
        //             date.getDate() > new Date().getDate()
        //                 ? new Date(
        //                       date.setFullYear(new Date().getFullYear() + 1),
        //                   )
        //                 : new Date(new Date().setTime(date.getTime()));
        //         break;
        //     default:
        //         date = null;
        //         break;
        // }

        // return date;
    }
}
