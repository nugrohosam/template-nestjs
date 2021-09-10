import { IPartyToken } from '../entities/party-token.entity';
import BN from 'bn.js';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { TransformBN } from 'src/common/utils/typeorm.util';

@Entity({ name: 'party_tokens' })
export class PartyTokenModel implements IPartyToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'party_id' })
    partyId: string;

    @Column('varchar')
    symbol: string;

    @Column('varchar')
    address: string;

    @Column('bigint', {
        transformer: TransformBN,
    })
    balance: BN;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;
}
