import { InjectRepository } from '@nestjs/typeorm';
import { GeckoCoinModel } from 'src/models/gecko-coin.model';
import { Repository } from 'typeorm';

export class GeckoCoinService {
    constructor(
        @InjectRepository(GeckoCoinModel)
        private readonly repository: Repository<GeckoCoinModel>,
    ) {}

    async getGeckoCoins(symbols: string[]): Promise<GeckoCoinModel[]> {
        return await this.repository
            .createQueryBuilder('gecko_coin')
            .where('symbol in (:...symbols)', { symbols })
            .getMany();
    }
}
