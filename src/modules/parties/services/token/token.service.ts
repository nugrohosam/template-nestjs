import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { config } from 'src/config';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { CurrencyModel } from 'src/models/currency.model';
import { Repository } from 'typeorm';
import { AbiItem } from 'web3-utils';
import { abi as ERC20ABI } from 'src/contracts/ERC20.json';
import { ContractSendMethod } from 'web3-eth-contract';
import BN from 'bn.js';

@Injectable()
export class TokenService {
    constructor(
        @InjectRepository(CurrencyModel)
        private readonly repository: Repository<CurrencyModel>,
        private readonly web3Service: Web3Service,
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

    async registerToken(tokenAddress: string): Promise<CurrencyModel> {
        const tokenInstance = await this.web3Service.getContractInstance(
            ERC20ABI as AbiItem[],
            tokenAddress,
        );
        const contractMethod =
            tokenInstance.methods.name() as ContractSendMethod;
        const symbol: string = await contractMethod.call();
        console.log('name token', symbol);
        const currency = this.repository.create({
            address: tokenAddress,
            symbol: symbol,
        });
        return this.repository.save(currency);
    }

    async getTokenBalance(
        ownerAddress: string,
        tokenAddress: string,
    ): Promise<BN> {
        const erc20Contract = await this.web3Service.getContractInstance(
            ERC20ABI as AbiItem[],
            tokenAddress,
        );

        const balance = await erc20Contract.methods
            .balanceOf(ownerAddress)
            .call();

        return new BN(balance);
    }
}