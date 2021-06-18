import {
    Model,
    Table,
    Column,
    DataType,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
} from 'sequelize-typescript';
import { IUser } from 'src/entities/user.entity';

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
}
