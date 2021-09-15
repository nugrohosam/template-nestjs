import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { config } from 'src/config';
import { CurrencyModel } from 'src/models/currency.model';
import { Repository } from 'typeorm';

@Injectable()
export class TokenService {
    constructor(
        @InjectRepository(CurrencyModel)
        private readonly repository: Repository<CurrencyModel>,
    ) {}

    async getDefaultToken(): Promise<CurrencyModel> {
        const defaultToken = config.defaultToken;

        let token = await this.repository
            .createQueryBuilder('currency')
            .where('address = :address', { address: defaultToken.address })
            .getOne();

        if (!token) {
            token = this.repository.create(defaultToken);
            token = await this.repository.save(token);
        }

        return token;
    }

    async getById(id: number): Promise<CurrencyModel> {
        return await this.repository
            .createQueryBuilder('currency')
            .where('id = :id', { id })
            .getOne();
    }
    async getByAddress(address: string): Promise<CurrencyModel> {
        return await this.repository
            .createQueryBuilder('currency')
            .where('address = :address', { address })
            .getOne();
    }
    async registerToken(
        address: string,
        symbol: string,
    ): Promise<CurrencyModel> {
        const currency = this.repository.create({
            address,
            symbol,
        });
        return this.repository.save(currency);
    }
}
