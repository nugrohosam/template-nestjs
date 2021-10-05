import { IAnnouncement } from 'src/entities/announcement.entity';
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

@Entity({ name: 'announcements' })
export class AnnouncementModel implements IAnnouncement {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column('uuid', { name: 'party_id' })
    partyId: string;

    @Column('varchar')
    title: string;

    @Column('varchar')
    body: string;

    @Column('varchar', { nullable: true })
    link?: string;

    @Column('varchar', { nullable: true, name: 'image_url' })
    imageUrl?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;

    @ManyToOne(() => PartyModel, (party) => party.notifications, {
        eager: true,
    })
    @JoinColumn({ name: 'party_id' })
    party?: PartyModel;
}
