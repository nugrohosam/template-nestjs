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
    totalFund?: bigint;

    @Column({
        field: 'min_deposit',
        type: DataType.BIGINT,
        allowNull: false,
        defaultValue: 0,
    })
    minDeposit?: bigint;

    @Column({
        field: 'max_deposit',
        type: DataType.BIGINT,
        allowNull: false,
        defaultValue: 0,
    })
    maxDeposit?: bigint;

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

    @HasMany(() => PartyMemberModel, 'partyId')
    readonly partyMembers?: PartyMemberModel[];

    @BelongsToMany(
        () => UserModel,
        () => PartyMemberModel,
        'partyId',
        'memberId',
    )
    readonly members?: UserModel[];

    @HasMany(() => PartyInvitationModel)
    readonly invitations?: PartyInvitationModel[];

    async isActive(): Promise<boolean> {
        if (!this.address || !this.transactionHash) return false;

        const partyMembers = await PartyMemberModel.findOne({
            where: { memberId: this.ownerId, partyId: this.id },
        });
        if (!partyMembers) return false;
        if (!partyMembers.depositTransactionId) return false;

        return true;
    }

    async isMember(user: UserModel): Promise<boolean> {
        const partyMembers = await PartyMemberModel.findOne({
            where: { memberId: user.id, partyId: this.id },
        });

        return partyMembers !== null;
    }
}
