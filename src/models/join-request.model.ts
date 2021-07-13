import {
    AllowNull,
    Column,
    CreatedAt,
    DataType,
    Default,
    DeletedAt,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
} from 'sequelize-typescript';
import { JoinRequestStatusEnum } from 'src/common/enums/party.enum';
import { IJoinRequest } from 'src/entities/join-request.entity';
import { PartyModel } from './party.model';

@Table({ tableName: 'join_requests', paranoid: true })
export class JoinRequestModel
    extends Model<IJoinRequest, IJoinRequest>
    implements IJoinRequest
{
    @PrimaryKey
    @AllowNull(false)
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id?: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING, field: 'user_address' })
    userAddress: string;

    @ForeignKey(() => PartyModel)
    @AllowNull(false)
    @Column({ type: DataType.STRING, field: 'prarty_id' })
    partyId: string;

    @Column({ type: DataType.DATE, field: 'accepted_at' })
    acceptedAt?: Date;

    @Column({ type: DataType.DATE, field: 'rejected_at' })
    rejectedAt?: Date;

    @CreatedAt
    @Column({ type: DataType.DATE, field: 'created_at' })
    createdAt?: Date;

    @UpdatedAt
    @Column({ type: DataType.DATE, field: 'updated_at' })
    updatedAt?: Date;

    @DeletedAt
    @Column({ type: DataType.DATE, field: 'deleted_at' })
    deletedAt?: Date;

    @Column({ type: DataType.VIRTUAL })
    get status(): JoinRequestStatusEnum {
        if (this.acceptedAt) {
            return JoinRequestStatusEnum.Accepted;
        } else if (this.rejectedAt) {
            return JoinRequestStatusEnum.Rejected;
        } else {
            return JoinRequestStatusEnum.Pending;
        }
    }
}
