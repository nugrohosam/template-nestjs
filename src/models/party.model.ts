import BN from 'bn.js';
import {
    BelongsTo,
    BelongsToMany,
    Column,
    CreatedAt,
    DataType,
    Default,
    DefaultScope,
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
import { useBigIntColumn } from 'src/common/utils/bigint-column.util';
import { IParty } from 'src/entities/party.entity';
import { PartyInvitationModel } from './party-invitation.model';
import { PartyMemberModel } from './party-member.model';
import { UserModel } from './user.model';

@DefaultScope(() => ({
    include: [
        { model: PartyMemberModel, as: 'partyMembers' },
        { model: UserModel, as: 'owner', required: true },
    ],
}))
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

    @Default(false)
    @Column({ field: 'is_featured', type: DataType.BOOLEAN })
    isFeatured?: boolean;

    @Column(useBigIntColumn(PartyModel, 'totalFund', 'total_fund'))
    totalFund?: BN;

    @Column(useBigIntColumn(PartyModel, 'minDeposit', 'min_deposit'))
    minDeposit?: BN;

    @Column(useBigIntColumn(PartyModel, 'maxDeposit', 'max_deposit'))
    maxDeposit?: BN;

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

    get isActive(): boolean {
        if (!this.address || !this.transactionHash) return false;

        const partyMembers = this.partyMembers
            ? this.partyMembers.filter(
                  (partyMember) => partyMember.memberId === this.ownerId,
              )
            : [];
        if (partyMembers.length <= 0) return false;

        return true;
    }

    async isMember(user: UserModel): Promise<boolean> {
        const partyMembers = await PartyMemberModel.findOne({
            where: { memberId: user.id, partyId: this.id },
        });

        return partyMembers !== null;
    }
}
