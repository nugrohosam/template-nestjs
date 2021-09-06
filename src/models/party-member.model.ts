import BN from 'bn.js';
import { MemberStatusEnum } from 'src/common/enums/party.enum';
import { TransformBN } from 'src/common/utils/typeorm.util';
import { IPartyMember } from 'src/entities/party-member.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { PartyModel } from './party.model';
import { ProposalDistributionModel } from './proposal-distribution.model';
import { ProposalVoteModel } from './proposal-vote.model';
import { TransactionModel } from './transaction.model';
import { UserModel } from './user.model';

@Entity({ name: 'party_members' })
export class PartyMemberModel implements IPartyMember {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column('uuid', { name: 'party_id' })
    partyId: string;

    @Column('uuid', { name: 'member_id' })
    memberId: string;

    @Column('bigint', { name: 'initial_fund', transformer: TransformBN })
    initialFund: BN;

    @Column('bigint', { name: 'total_fund', transformer: TransformBN })
    totalFund: BN;

    @Column('bigint', { name: 'total_deposit', transformer: TransformBN })
    totalDeposit: BN;

    @Column('int', { transformer: TransformBN })
    weight: BN;

    @Column('varchar')
    signature: string;

    @Column('varchar', { name: 'transaction_hash' })
    transactionHash?: string;

    @Column('uuid', { name: 'deposit_transaction_id' })
    depositTransactionId?: string;

    @Column('varchar', { name: 'leave_transaction_hash', nullable: true })
    leaveTransactionHash?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;

    @ManyToOne(() => PartyModel, (party) => party.partyMembers)
    @JoinColumn({ name: 'party_id' })
    party?: Promise<PartyModel>;

    @ManyToOne(() => UserModel, (user) => user.joinedPartyMembers)
    @JoinColumn({ name: 'member_id' })
    member?: Promise<UserModel>;

    @OneToOne(
        () => TransactionModel,
        (transaction) => transaction.depositedPartyMember,
    )
    @JoinColumn({ name: 'deposit_transaction_id' })
    depositTransaction?: TransactionModel;

    @OneToMany(() => ProposalVoteModel, (vote) => vote.member)
    votes?: ProposalVoteModel[];

    @OneToMany(
        () => ProposalDistributionModel,
        (proposalDistribution) => proposalDistribution.member,
    )
    distributions?: ProposalDistributionModel[];

    get status(): MemberStatusEnum {
        if (this.deletedAt) return MemberStatusEnum.InActive;

        return MemberStatusEnum.Active;
    }
}
