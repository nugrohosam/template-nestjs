import BN from 'bn.js';
import { TransformBN } from 'src/common/utils/typeorm.util';
import { ISwapTransaction } from 'src/entities/swap-transaction.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'swap_transactions' })
export class SwapTransactionModel implements ISwapTransaction {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column('varchar', { name: 'token_from' })
    token_from: string;

    @Column('varchar', { name: 'token_target' })
    token_target: string;

    @Column('bigint', { transformer: TransformBN })
    buy_amount: BN;

    @Column('bigint', { transformer: TransformBN })
    sell_amount: BN;

    @Column('varchar', { name: 'transaction_hash' })
    transactionHash: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;
}
