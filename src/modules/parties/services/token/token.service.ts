import {
    HttpService,
    Injectable,
    UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { config } from 'src/config';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { CurrencyModel } from 'src/models/currency.model';
import { Repository } from 'typeorm';
import BN from 'bn.js';
import { Erc20AbiItem } from 'src/contracts/ERC20';
import { IFetchMarketsResp } from './get-token-price.service';
import { AxiosResponse, AxiosError } from 'axios';

@Injectable()
export class TokenService {
    constructor(
        @InjectRepository(CurrencyModel)
        private readonly repository: Repository<CurrencyModel>,
        private readonly web3Service: Web3Service,
        private readonly httpService: HttpService,
    ) {}

    async fetchTokenContractInfo(
        tokenAddress: string,
    ): Promise<AxiosResponse<IFetchMarketsResp>> {
        return this.httpService
            .get<IFetchMarketsResp>(
                `${
                    config.api.gecko
                }/coins/polygon-pos/contract/${tokenAddress.toLowerCase()}`,
            )
            .toPromise();
    }

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
        // TODO: temporarily replaced by geckoCoin checker
        /*         const tokenInstance = this.web3Service.getContractInstance(
            Erc20AbiItem,
            tokenAddress,
        );
        const contractMethod =
            tokenInstance.methods.symbol() as ContractSendMethod;
        const symbol: string = await contractMethod.call(); */
        const geckoNet: AxiosResponse<IFetchMarketsResp> =
            await this.fetchTokenContractInfo(tokenAddress).catch(
                (error: AxiosError) => {
                    console.log('gecko coin contract', error.response.data);
                    throw new UnprocessableEntityException(
                        'Token Not Supported',
                        error.response.data.error,
                    );
                },
            );
        console.log('name token', geckoNet.data.symbol);
        console.log('id token', geckoNet.data.id);

        const currency = this.repository.create({
            address: tokenAddress,
            symbol: geckoNet.data.symbol,
            geckoTokenId: geckoNet.data.id,
        });
        return this.repository.save(currency);
    }

    async getTokenBalance(
        ownerAddress: string,
        tokenAddress: string,
    ): Promise<BN> {
        const erc20Contract = this.web3Service.getContractInstance(
            Erc20AbiItem,
            tokenAddress,
        );

        const balance = await erc20Contract.methods
            .balanceOf(ownerAddress)
            .call();

        return new BN(balance);
    }

    async getTokenDecimal(tokenAddress: string): Promise<string> {
        const erc20Contract = this.web3Service.getContractInstance(
            Erc20AbiItem,
            tokenAddress,
        );

        const decimal = await erc20Contract.methods.decimals().call();

        return decimal;
    }
}
