import {
    Model,
    Table,
    Column,
    DataType,
    CreatedAt,
    UpdatedAt,
} from 'sequelize-typescript';
import { UserTypeEnum } from 'src/common/enums/user.enum';

export interface IUserModel {
    id?: number;
    name: string;
    email: string;
    password: string;
    userType?: UserTypeEnum;
    createdAt?: Date;
    updatedAt?: Date;
}

@Table({ tableName: 'users', timestamps: false })
export class UserModel
    extends Model<IUserModel, IUserModel>
    implements IUserModel
{
    @Column({
        field: 'id',
        primaryKey: true,
        autoIncrement: true,
        type: DataType.INTEGER,
    })
    id?: number;

    @Column({ field: 'name', type: DataType.STRING() })
    name: string;

    @Column({ field: 'email', type: DataType.STRING() })
    email: string;

    @Column({ field: 'password', type: DataType.STRING() })
    password: string;

    @Column({
        field: 'user_type',
        type: DataType.ENUM(UserTypeEnum.Biasa, UserTypeEnum.LuarBiasa),
    })
    userType: UserTypeEnum;

    @Column({ field: 'created_at', type: DataType.DATE })
    @CreatedAt
    created_at: Date;

    @Column({ field: 'updated_at', type: DataType.DATE })
    @UpdatedAt
    updatedAt: Date;
}
