import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionVolumeModel } from 'src/models/transaction-volume.model';
import { ITransactionVolume } from 'src/entities/transaction-voluime.entity';
import { Cache } from 'cache-manager';

export enum VolumeEnumOptions {
    All = 'All',
    IsSync = 'IsSync',
    IsNotSync = 'IsNotSync',
}

@Injectable()
export class TransactionVolumeService {
    constructor(
        @InjectRepository(TransactionVolumeModel)
        private readonly repository: Repository<TransactionVolumeModel>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    private getVolumeCacheKey(partyId: string): string {
        return `VL_${partyId}}`;
    }

    async get24Hours(partyId: string): Promise<string> {
        const keyVolumeCache = this.getVolumeCacheKey(partyId);
        let volume = await this.cacheManager.get<string>(keyVolumeCache);
        console.log(volume);
        if (!volume) {
            const { sum } = await this.repository
                .createQueryBuilder('tx')
                .select('SUM(tx.amount_usd)', 'sum')
                .where('tx.party_id = :partyId', { partyId })
                .andWhere('date(created_at) = date(now()) + interval -24 hour')
                .getRawOne();
            volume = sum;
            await this.cacheManager.set(keyVolumeCache, sum, {
                ttl: 10,
            });
        }

        return volume;
    }

    async store(data: ITransactionVolume): Promise<TransactionVolumeModel> {
        const transactionSync = this.repository.create(data);
        return this.repository.save(transactionSync);
    }
}
