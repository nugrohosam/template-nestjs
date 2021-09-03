import { JoinRequestStatusEnum } from 'src/common/enums/party.enum';
import { IJoinRequest } from 'src/entities/join-request.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { PartyModel } from './party.model';
import { UserModel } from './user.model';

@Entity({ name: 'join_requests' })
export class JoinRequestModel implements IJoinRequest {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column('uuid', { name: 'user_id' })
    userId: string;

    @Column('uuid', { name: 'party_id' })
    partyId: string;

    @Column('uuid', { name: 'processed_by' })
    processedBy: string;

    @Column('timestamp', { nullable: true, name: 'accepted_at' })
    acceptedAt?: Date;

    @Column('timestamp', { name: 'rejected_at' })
    rejectedAt?: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;

    get status(): JoinRequestStatusEnum {
        if (this.acceptedAt) {
            return JoinRequestStatusEnum.Accepted;
        } else if (this.rejectedAt) {
            return JoinRequestStatusEnum.Rejected;
        } else {
            return JoinRequestStatusEnum.Pending;
        }
    }

    @ManyToOne(() => PartyModel, (party) => party.joinRequests)
    @JoinColumn({ name: 'party_id' })
    readonly party?: Promise<PartyModel>;

    @ManyToOne(() => UserModel, (user) => user.joinRequests)
    @JoinColumn({ name: 'user_id' })
    readonly user?: Promise<UserModel>;
}
