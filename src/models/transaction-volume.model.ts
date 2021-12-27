import BigNumber from 'bignumber.js';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { TransformBigNumber } from 'src/common/utils/typeorm.util';
import { ITransactionVolume } from 'src/entities/transaction-voluime.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { PartyModel } from './party.model';

@Entity({ name: 'transaction_volume' })
export class TransactionVolumeModel implements ITransactionVolume {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column('uuid', { name: 'party_id' })
    partyId: string;

    @Column('varchar', { name: 'transaction_hash' })
    transactionHash: string;

    @Column('enum', { enum: TransactionTypeEnum })
    type: TransactionTypeEnum;

    @Column('varchar', { name: 'amount_usd', transformer: TransformBigNumber })
    amountUsd: BigNumber;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;

    @ManyToOne(() => PartyModel, (party) => party.swapTransaction)
    @JoinColumn({ name: 'party_id' })
    party?: PartyModel;
}
