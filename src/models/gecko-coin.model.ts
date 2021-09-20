import { IGeckoCoin } from 'src/entities/gecko-coin.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'gecko_coins' })
export class GeckoCoinModel implements IGeckoCoin {
    @PrimaryColumn()
    id: string;

    @Column()
    symbol: string;

    @Column()
    name: string;
}
