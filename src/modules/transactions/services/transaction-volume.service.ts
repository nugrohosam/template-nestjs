import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionVolumeModel } from 'src/models/transaction-volume.model';
import { ITransactionVolume } from 'src/entities/transaction-voluime.entity';

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
    ) {}

    async get(
        option: VolumeEnumOptions = VolumeEnumOptions.All,
    ): Promise<TransactionVolumeModel[]> {
        const query = this.repository.createQueryBuilder('trx');

        switch (option) {
            case VolumeEnumOptions.IsSync:
                query.where('trx.is_sync= :isSync', {
                    isSync: true,
                });
                break;
            case VolumeEnumOptions.IsNotSync:
                query.where('trx.is_sync= :isSync', {
                    isSync: false,
                });
                break;
            default:
                break;
        }
        return query.getMany();
    }

    async store(data: ITransactionVolume): Promise<TransactionVolumeModel> {
        const transactionSync = this.repository.create(data);
        return this.repository.save(transactionSync);
    }
}
