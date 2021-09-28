import { IPartyGain } from 'src/entities/party-gain.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import BN from 'bn.js';
import { TransformBN } from 'src/common/utils/typeorm.util';

@Entity({ name: 'party_gains' })
export class PartyGainModel implements IPartyGain {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'party_id' })
    partyId: string;

    @Column('bigint', { transformer: TransformBN })
    fund: BN;

    @Column('bigint', { transformer: TransformBN })
    gain: BN;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;

    @Column({
        type: 'bigint',
        select: false,
        update: false,
        insert: false,
        transformer: TransformBN,
    })
    lastFund?: BN;
}
