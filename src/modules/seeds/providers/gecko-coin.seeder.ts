import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IGeckoCoin } from 'src/entities/gecko-coin.entity';
import { GeckoCoinModel } from 'src/models/gecko-coin.model';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Injectable()
export class GeckoCoinSeeder {
    private coins: IGeckoCoin[];

    constructor(
        @InjectRepository(GeckoCoinModel)
        private readonly repository: Repository<GeckoCoinModel>,
    ) {
        this.coins = require('databases/coin-gecko.json');
    }

    @Transactional()
    async seed(): Promise<void> {
        await this.repository.clear();
        for (let i = 0; i < this.coins.length; i++) {
            await this.repository.insert({
                id: this.coins[i].id as string,
                symbol: this.coins[i].symbol as string,
                name: this.coins[i].name as string,
            });
        }
    }
}
