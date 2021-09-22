import { IPartyToken } from '../entities/party-token.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'party_tokens' })
export class PartyTokenModel implements IPartyToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid', { name: 'party_id' })
    partyId: string;

    @Column('varchar', {
        transformer: {
            to: (value: string) => value,
            from: (value: string) => value.toLowerCase(),
        },
    })
    symbol: string;

    @Column('varchar')
    address: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;
}
