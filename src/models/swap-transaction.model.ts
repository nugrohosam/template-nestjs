import BN from 'bn.js';
import {
    ColumnNumericTransformer,
    TransformBN,
} from 'src/common/utils/typeorm.util';
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

    @Column('bigint', { name: 'buy_amount', transformer: TransformBN })
    buyAmount: BN;

    @Column('bigint', { name: 'sell_amount', transformer: TransformBN })
    sellAmount: BN;

    @Column('decimal', {
        name: 'usd',
        precision: 10,
        scale: 6,
        default: 0,
        transformer: ColumnNumericTransformer,
    })
    usd: number;

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
