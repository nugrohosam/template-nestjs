import {
    Model,
    Table,
    Column,
    DataType,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
    HasMany,
    Index,
} from 'sequelize-typescript';
import { IUser } from 'src/entities/user.entity';
import { JoinRequestModel } from './join-request.model';
import { PartyModel } from './party.model';

@Table({ tableName: 'users', paranoid: true })
export class UserModel extends Model<IUser, IUser> implements IUser {
    @Column({
        field: 'id',
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    id?: string;

    @Index
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

    async joinRequestStatus(partyId: string): Promise<string | undefined> {
        const joinRequest = await JoinRequestModel.findOne({
            where: {
                partyId,
                userId: this.id,
            },
        });

        if (!joinRequest) return undefined;

        return joinRequest.status;
    }
}
