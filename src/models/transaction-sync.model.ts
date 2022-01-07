import { PartyEvents } from 'src/contracts/Party';
import { ITransactionSync } from 'src/entities/transaction-sync.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'transaction_sync' })
export class TransactionSyncModel implements ITransactionSync {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column('varchar', { name: 'transaction_hash' })
    transactionHash: string;

    @Column('enum', { name: 'event_name', enum: PartyEvents })
    eventName: PartyEvents;

    @Column('boolean', { name: 'is_sync' })
    isSync: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;
}
