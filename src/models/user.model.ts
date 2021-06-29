import {
    Model,
    Table,
    Column,
    DataType,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
    HasMany,
} from 'sequelize-typescript';
import { IUser } from 'src/entities/user.entity';
import { PartyModel } from './party.model';
import { WhitelistedAddressModel } from './whitelisted-address.model';

@Table({ tableName: 'users', paranoid: true })
export class UserModel extends Model<IUser, IUser> implements IUser {
    @Column({
        field: 'id',
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    id?: string;

    @Column({ field: 'address', type: DataType.STRING, allowNull: false })
    address: string;

    @Column({ field: 'username', type: DataType.STRING })
    username?: string;

    @Column({ field: 'firstname', type: DataType.STRING })
    firstname?: string;

    @Column({ field: 'lastname', type: DataType.STRING })
    lastname?: string;

    @Column({ field: 'image_url', type: DataType.TEXT })
    imageUrl?: string;

    @Column({ field: 'location', type: DataType.STRING })
    location?: string;

    @Column({ field: 'email', type: DataType.STRING })
    email?: string;

    @Column({ field: 'about', type: DataType.TEXT })
    about?: string;

    @Column({ field: 'website', type: DataType.STRING })
    website?: string;

    @Column({ field: 'created_at', type: DataType.DATE })
    @CreatedAt
    createdAt?: Date;

    @Column({ field: 'updated_at', type: DataType.DATE })
    @UpdatedAt
    updatedAt?: Date;

    @Column({ field: 'deleted_at', type: DataType.DATE })
    @DeletedAt
    deletedAt?: Date;

    @HasMany(() => PartyModel, 'creatorId')
    ownedParties?: PartyModel[];

    static associate(): void {
        UserModel.hasMany(PartyModel, {
            as: 'ownedParties',
            foreignKey: 'ownerId',
            sourceKey: 'id',
            onDelete: 'set null',
        });

        UserModel.hasMany(PartyModel, {
            as: 'createdParties',
            foreignKey: 'creatorId',
            sourceKey: 'id',
            onDelete: 'set null',
        });

        UserModel.hasOne(WhitelistedAddressModel, {
            as: 'whitelistedAddress',
            foreignKey: 'user_id',
            sourceKey: 'id',
        });
    }
}
