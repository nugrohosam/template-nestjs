/**
 * This model is used for internal development only
 * to validate who can create party.
 */

import { Model, Table, Column, DataType } from 'sequelize-typescript';
import { UserModel } from './user.model';

export class IWhitelistedAddress {
    userId: string;
    address: string;
}

@Table({ tableName: 'whitelisted_addresses', paranoid: true })
export class WhitelistedAddressModel
    extends Model<IWhitelistedAddress, IWhitelistedAddress>
    implements IWhitelistedAddress
{
    @Column({
        field: 'user_id',
        primaryKey: true,
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
    })
    userId: string;

    @Column({ field: 'address', type: DataType.STRING, allowNull: false })
    address: string;

    static associate(): void {
        WhitelistedAddressModel.belongsTo(UserModel, {
            as: 'user',
            foreignKey: 'user_id',
            targetKey: 'id',
        });
    }
}
