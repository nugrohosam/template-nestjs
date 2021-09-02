import BN from 'bn.js';
import {
    DistributionTypeEnum,
    PartyTypeEnum,
} from 'src/common/enums/party.enum';
import { IParty } from 'src/entities/party.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { JoinRequestModel } from './join-request.model';
import { PartyMemberModel } from './party-member.model';
import { ProposalModel } from './proposal.model';
import { UserModel } from './user.model';

@Entity({ name: 'parties' })
export class PartyModel implements IParty {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column('varchar')
    address?: string;

    @Column('varchar')
    name: string;

    @Column('enum', { enum: PartyTypeEnum })
    type: PartyTypeEnum;

    @Column('varchar')
    purpose: string;

    @Column('varchar', { name: 'image_url', nullable: true })
    imageUrl?: string;

    @Column('uuid', { name: 'creator_id' })
    creatorId: string;

    @Column('uuid', { name: 'owner_id' })
    ownerId: string;

    @Column('boolean', { name: 'is_public' })
    isPublic: boolean;

    @Column('boolean', { name: 'is_featured', nullable: true })
    isFeatured?: boolean;

    @Column('bigint', { name: 'total_fund', nullable: true })
    totalFund?: BN;

    @Column('bigint', { name: 'min_deposit', nullable: true })
    minDeposit?: BN;

    @Column('bigint', { name: 'max_deposit', nullable: true })
    maxDeposit?: BN;

    @Column('bigint', { name: 'total_deposit', nullable: true })
    totalDeposit?: BN;

    @Column('int', { name: 'total_member', nullable: true })
    totalMember?: number;

    @Column('enum', { enum: DistributionTypeEnum })
    distribution: DistributionTypeEnum;

    @Column('varchar')
    signature: string;

    @Column('varchar', { name: 'transaction_hash', nullable: true })
    transactionHash?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    @CreateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;

    @CreateDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;

    @ManyToOne(() => UserModel, (user) => user.ownedParties)
    @JoinColumn({ name: 'owner_id' })
    owner?: Promise<UserModel>;

    @ManyToOne(() => UserModel, (user) => user.createdParties)
    @JoinColumn({ name: 'creator_id' })
    creator?: Promise<UserModel>;

    @OneToMany(() => JoinRequestModel, (joinRequest) => joinRequest.party)
    joinRequests?: Promise<JoinRequestModel[]>;

    @OneToMany(() => PartyMemberModel, (partyMember) => partyMember.party)
    partyMembers?: Promise<PartyMemberModel[]>;

    @OneToMany(() => ProposalModel, (proposal) => proposal.party)
    proposals?: Promise<ProposalModel[]>;

    isActive?: boolean;
    isMember?: boolean;
}
