import { IPartyToken } from '../entities/party-token.entity';
import BN from 'bn.js';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export class PartyTokenModel implements IPartyToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'party_id' })
    partyId: string;

    @Column('varchar')
    symbol: string;

    @Column('varchar')
    address: string;

    @Column('bigint')
    balance: BN;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;
}
