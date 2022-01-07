import BN from 'bn.js';
import {
    DistributionTypeEnum,
    JoinRequestStatusEnum,
    PartyTypeEnum,
} from 'src/common/enums/party.enum';
import { GainPeriod, IParty } from 'src/entities/party.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { JoinRequestModel } from './join-request.model';
import { PartyMemberModel } from './party-member.model';
import { ProposalModel } from './proposal.model';
import { UserModel } from './user.model';
import { TransformBN } from 'src/common/utils/typeorm.util';
import web3 from 'web3';
import { SwapTransactionModel } from './swap-transaction.model';
import { AnnouncementModel } from './announcement.model';

@Entity({ name: 'parties' })
export class PartyModel implements IParty {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column('varchar', {
        unique: true,
        nullable: true,
        transformer: {
            to: (value?: string) =>
                value ? web3.utils.toChecksumAddress(value) : null,
            from: (value?: string) =>
                value ? web3.utils.toChecksumAddress(value) : null,
        },
    })
    address?: string;

    @Column('varchar')
    name: string;

    @Column('enum', { enum: PartyTypeEnum })
    type: PartyTypeEnum;

    @Column('varchar')
    purpose: string;

    @Column('varchar', { name: 'image_url', nullable: true })
    imageUrl?: string;

    @Column('text', { nullable: true })
    bio?: string;

    @Column('uuid', { name: 'creator_id', nullable: true })
    creatorId: string;

    @Column('uuid', { name: 'owner_id', nullable: true })
    ownerId: string;

    @Column('boolean', { name: 'is_public' })
    isPublic: boolean;

    @Column('boolean', { name: 'is_featured', nullable: true })
    isFeatured?: boolean;

    @Column('boolean', { name: 'is_closed' })
    isClosed?: boolean;

    @Column('bigint', {
        name: 'min_deposit',
        nullable: true,
        transformer: TransformBN,
    })
    minDeposit?: BN;

    @Column('bigint', {
        name: 'max_deposit',
        nullable: true,
        transformer: TransformBN,
    })
    maxDeposit?: BN;

    @Column('bigint', {
        name: 'total_deposit',
        nullable: true,
        transformer: TransformBN,
    })
    totalDeposit?: BN;

    @Column('bigint', {
        name: 'total_fund',
        nullable: true,
        transformer: TransformBN,
    })
    totalFund?: BN;

    @Column('enum', { enum: DistributionTypeEnum })
    distribution: DistributionTypeEnum;

    @Column('date', { name: 'distribution_date' })
    distributionDate: Date;

    @Column('json')
    gain: Record<GainPeriod, number>;

    @Column('varchar')
    signature: string;

    @Column('varchar', { name: 'transaction_hash', nullable: true })
    transactionHash?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;

    @ManyToOne(() => UserModel, (user) => user.ownedParties, { eager: true })
    @JoinColumn({ name: 'owner_id' })
    owner?: UserModel;

    @ManyToOne(() => UserModel, (user) => user.createdParties, { eager: true })
    @JoinColumn({ name: 'creator_id' })
    creator?: UserModel;

    @OneToMany(() => JoinRequestModel, (joinRequest) => joinRequest.party)
    joinRequests?: JoinRequestModel;

    @OneToMany(() => PartyMemberModel, (partyMember) => partyMember.party)
    partyMembers?: PartyMemberModel;

    @OneToMany(
        () => SwapTransactionModel,
        (swapTransaction) => swapTransaction.party,
    )
    swapTransaction?: SwapTransactionModel;

    @OneToMany(() => ProposalModel, (proposal) => proposal.party)
    proposals?: ProposalModel;

    @OneToMany(() => AnnouncementModel, (notificaton) => notificaton.party)
    notifications?: AnnouncementModel;

    // Computed Columns

    @Column({
        type: 'varchar',
        length: 1,
        select: false,
        update: false,
        insert: false,
        transformer: {
            to: (value) => value == 1 || value === 'true',
            from: (value) => value == 1 || value === 'true',
        },
    })
    isActive?: boolean;

    @Column({
        type: 'varchar',
        length: 1,
        select: false,
        update: false,
        insert: false,
        transformer: {
            to: (value) => value == 1 || value === 'true',
            from: (value) => value == 1 || value === 'true',
        },
    })
    isMember?: boolean;

    @Column({
        type: 'varchar',
        select: false,
        update: false,
        insert: false,
    })
    joinRequestStatus?: JoinRequestStatusEnum;

    @Column({
        type: 'int',
        select: false,
        update: false,
        insert: false,
        transformer: {
            to: (value) => +value,
            from: (value) => +value,
        },
    })
    totalMember?: number;

    @Column({
        type: 'bigint',
        select: false,
        update: false,
        insert: false,
        transformer: TransformBN,
    })
    lastFund?: BN;

    @Column({
        type: 'bigint',
        select: false,
        update: false,
        insert: false,
        transformer: TransformBN,
    })
    initialFund?: BN;

    volume?: string;
}
