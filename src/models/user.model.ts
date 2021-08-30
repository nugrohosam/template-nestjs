import { IUser } from 'src/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { JoinRequestModel } from './join-request.model';
import { PartyMemberModel } from './party-member.model';
import { PartyModel } from './party.model';
import { Proposal } from './proposal.model';

@Entity({ name: 'users' })
export class UserModel implements IUser {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column('varchar')
    address: string;

    @Column('varchar', { nullable: true })
    username?: string;

    @Column('varchar', { nullable: true })
    firstname?: string;

    @Column('varchar', { nullable: true })
    lastname?: string;

    @Column('text', { nullable: true })
    imageUrl?: string;

    @Column('varchar', { nullable: true })
    location?: string;

    @Column('varchar', { nullable: true })
    email?: string;

    @Column('text', { nullable: true })
    about?: string;

    @Column('varchar', { nullable: true })
    website?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;

    @OneToMany(() => PartyModel, (party) => party.owner)
    ownedParties?: PartyModel[];

    @OneToMany(() => PartyModel, (party) => party.creator)
    createdParties?: PartyModel[];

    @OneToMany(() => JoinRequestModel, (joinRequest) => joinRequest.user)
    joinRequests?: JoinRequestModel[];

    @OneToMany(() => PartyMemberModel, (partyMember) => partyMember.member)
    joinedPartyMembers?: PartyMemberModel[];

    @OneToMany(() => Proposal, (proposal) => proposal.creator)
    proposals?: Proposal[];

    // async joinRequestStatus(partyId: string): Promise<string | undefined> {
    //     const joinRequest = await JoinRequestModel.findOne({
    //         where: {
    //             partyId,
    //             userId: this.id,
    //         },
    //     });

    //     if (!joinRequest) return undefined;

    //     return joinRequest.status;
    // }
}
