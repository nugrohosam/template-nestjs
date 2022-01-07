import { InjectRepository } from '@nestjs/typeorm';
import { GeckoCoinModel } from 'src/models/gecko-coin.model';
import { Repository } from 'typeorm';

export class GeckoCoinService {
    constructor(
        @InjectRepository(GeckoCoinModel)
        private readonly repository: Repository<GeckoCoinModel>,
    ) {}

    async getGeckoCoins(ids: string[]): Promise<GeckoCoinModel[]> {
        return await this.repository
            .createQueryBuilder('gecko_coin')
            .where('id in (:...ids)', { ids })
            .getMany();
    }
}
