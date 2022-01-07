import BN from 'bn.js';
import { TransformBigNumber, TransformBN } from 'src/common/utils/typeorm.util';
import { ISwapTransaction } from 'src/entities/swap-transaction.entity';
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

@Entity({ name: 'swap_transactions' })
export class SwapTransactionModel implements ISwapTransaction {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column('uuid', { name: 'party_id' })
    partyId: string;

    @Column('varchar', { name: 'token_from' })
    tokenFrom: string;

    @Column('varchar', { name: 'token_target' })
    tokenTarget: string;

    @Column('varchar', { name: 'buy_amount', transformer: TransformBN })
    buyAmount: BN;

    @Column('varchar', { name: 'sell_amount', transformer: TransformBN })
    sellAmount: BN;

    @Column('varchar', { name: 'usd', transformer: TransformBigNumber })
    usd: string;

    @Column('varchar', { name: 'transaction_hash' })
    transactionHash: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;

    @ManyToOne(() => PartyModel, (party) => party.swapTransaction)
    @JoinColumn({ name: 'party_id' })
    party?: PartyModel;
}
