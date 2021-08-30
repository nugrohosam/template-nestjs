import BN from 'bn.js';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { ITransaction } from 'src/entities/transaction.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { PartyMemberModel } from './party-member.model';

@Entity({ name: 'transactions' })
export class TransactionModel implements ITransaction {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column('varchar', { name: 'address_from' })
    addressFrom: string;

    @Column('varchar', { name: 'address_to' })
    addressTo: string;

    @Column('bigint')
    amount: BN;

    @Column('int', { name: 'currency_id' })
    currencyId: number;

    @Column('enum', { enum: TransactionTypeEnum })
    type: TransactionTypeEnum;

    @Column('text')
    description?: string;

    @Column('varchar')
    signature: string;

    @Column('varchar', { name: 'transaction_hash' })
    transactionHash: string;

    @Column('boolean', { name: 'transaction_hash_status' })
    transactionHashStatus: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;

    @OneToOne(
        () => PartyMemberModel,
        (partyMember) => partyMember.depositTransaction,
    )
    depositedPartyMember?: PartyMemberModel;
}
