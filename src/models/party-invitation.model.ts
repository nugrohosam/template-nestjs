import {
    AllowNull,
    BelongsTo,
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
import { IPartyInvitation } from 'src/entities/parti-invitation.entity';
import { PartyModel } from './party.model';

@Table({ tableName: 'party_invitations', paranoid: true })
export class PartyInvitationModel
    extends Model<IPartyInvitation, IPartyInvitation>
    implements IPartyInvitation
{
    @PrimaryKey
    @AllowNull(false)
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id?: string;

    @ForeignKey(() => PartyModel)
    @AllowNull(false)
    @Column({ type: DataType.UUID, field: 'party_id' })
    partyId: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING, field: 'user_address' })
    userAddress: string;

    @Column({ type: DataType.DATE, field: 'accepted_at' })
    acceptedAt: Date | null;

    @CreatedAt
    @Column({ type: DataType.DATE, field: 'created_at' })
    createdAt: Date | null;

    @UpdatedAt
    @Column({ type: DataType.DATE, field: 'updated_at' })
    updatedAt: Date | null;

    @DeletedAt
    @Column({ type: DataType.DATE, field: 'deleted_at' })
    deletedAt: Date | null;

    @BelongsTo(() => PartyModel, 'party_id')
    party: PartyModel;
}
