import {
    HttpService,
    Injectable,
    UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Erc20AbiItem } from 'src/contracts/ERC20';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { GeckoCoinModel } from 'src/models/gecko-coin.model';
import { Repository } from 'typeorm';
import { ContractSendMethod } from 'web3-eth-contract';
import { IFetchMarketsResp } from './get-token-price.service';
import { AxiosResponse, AxiosError } from 'axios';
import { config } from 'src/config';

@Injectable()
export class GeckoTokenService {
    constructor(
        @InjectRepository(GeckoCoinModel)
        private readonly repository: Repository<GeckoCoinModel>,
        private readonly httpService: HttpService,

        private readonly web3Service: Web3Service,
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

    async checkAndRegisterCoin(tokenAddress: string): Promise<GeckoCoinModel> {
        const tokenInstance = this.web3Service.getContractInstance(
            Erc20AbiItem,
            tokenAddress,
        );
        const contractMethod =
            tokenInstance.methods.symbol() as ContractSendMethod;
        const symbol: string = await contractMethod.call();
        console.log('name symbol', symbol);
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
        console.log('id symbol', geckoNet.data.id);
        const coin = await this.getById(symbol);
        if (!coin) {
            const geckoCoin = this.repository.create({
                id: geckoNet.data.id,
                name: geckoNet.data.name,
                symbol: symbol,
            });
            return this.repository.save(geckoCoin);
        }
        return coin;
    }

    async getById(id: string): Promise<GeckoCoinModel> {
        return await this.repository
            .createQueryBuilder('gecko_coins')
            .where('id = :id', { id: id })
            .getOne();
    }
}
