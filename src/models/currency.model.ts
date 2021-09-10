import { ICurrency } from 'src/entities/currency.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'currencies' })
export class CurrencyModel implements ICurrency {
    @PrimaryGeneratedColumn('increment')
    id?: number;

    @Column('varchar')
    symbol: string;

    @Column('varchar')
    address: string;

    @Column('text', { nullable: true })
    description?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt?: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;
}
