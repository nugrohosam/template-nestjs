import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Injectable } from '@nestjs/common';
import { config } from 'src/config';
import { PartyModel } from 'src/models/party.model';
import { GeckoCoinService } from 'src/modules/commons/providers/gecko-coin.service';
import { InjectRepository } from '@nestjs/typeorm';
import { PartyTokenModel } from 'src/models/party-token.model';
import { Repository } from 'typeorm';
import { GetTokenBalanceService } from '../../utils/get-token-balance.util';

export interface IFetchMarketsParams {
    vsCurrency: string;
    ids?: string;
    category?: string;
    order?: string;
    perPage?: number;
    page?: number;
    sparkline?: boolean;
    priceChangePercentage?: string;
}

export interface ITokenBalanceParty {
    [key: string]: {
        balance: string;
        decimal: string;
    };
}

export interface IFetchMarketsResp {
    id: string;
    symbol: string;
    name: string;
    image: string;
    currentPrice: number;
    marketCap: number;
    marketCapRank: number;
    fullyDilutedValuation: number;
    totalVolume: number;
    high24h: number;
    low24h: number;
    priceChange24h: number;
    priceChangePercentage24h: number;
    marketCapChange24h: number;
    marketCapChangePercentage24h: number;
    circulatingSupply: number;
    totalSupply: number;
    maxSupply: number;
    ath: number;
    athChangePercentage: number;
    athDate: Date;
    atl: number;
    atlChangePercentage: number;
    atlDate: Date;
    lastUpdated: Date;
    priceChangePercentage14dInCurrency?: number;
    priceChangePercentage1hInCurrency?: number;
    priceChangePercentage1yInCurrency?: number;
    priceChangePercentage200dInCurrency?: number;
    priceChangePercentage24hInCurrency?: number;
    priceChangePercentage30dInCurrency?: number;
    priceChangePercentage7dInCurrency?: number;
}

@Injectable()
export class GetTokenPriceService {
    constructor(
        private readonly httpService: HttpService,
        private readonly geckoCoinService: GeckoCoinService,
        @InjectRepository(PartyTokenModel)
        private readonly partyTokenRepository: Repository<PartyTokenModel>,
        private readonly getTokenBalanceService: GetTokenBalanceService,
    ) {}

    async getMarketValue(
        params: IFetchMarketsParams,
    ): Promise<AxiosResponse<IFetchMarketsResp[]>> {
        return this.httpService
            .get<IFetchMarketsResp[]>(`${config.api.gecko}/coins/markets`, {
                params,
            })
            .toPromise();
    }

    async getPartyTokenValue(party: PartyModel): Promise<number> {
        const partyTokens = await this.partyTokenRepository
            .createQueryBuilder('partyToken')
            .where('party_id = :partyId', { partyId: party.id })
            .getMany();
        // map to get list token symbol
        const tokensSymbol = partyTokens.map((item) => {
            return item.symbol;
        });
        const coins = await this.geckoCoinService.getGeckoCoins(tokensSymbol);
        if (!coins.length) return 0;
        const ids = coins.map((coin) => coin.id).join(',');
        const marketValue = await this.getMarketValue({
            vsCurrency: 'usd',
            ids: ids,
            page: 1,
            perPage: 100,
            priceChangePercentage: '1h,24h,7d',
        });
        const partyToken: ITokenBalanceParty = {};
        // set contract token data to token balance party
        const promiseToken = partyTokens.map(async (item) => {
            const tokenBalance =
                await this.getTokenBalanceService.getTokenBalance(
                    item.address,
                    item.symbol,
                    party.address,
                );
            return (partyToken[tokenBalance.name] = {
                balance: tokenBalance.balance,
                decimal: tokenBalance.decimal,
            });
        });
        await Promise.all(promiseToken);
        // ---- normalizing data -----
        // -----------------------------
        let totalFund = 0;
        // iterate all coin from party which fetch before to calculate total value
        marketValue.data.forEach((item) => {
            const tokenValue = this.getTokenBalanceIn(
                partyToken,
                item.symbol,
                item.currentPrice,
            );
            totalFund += tokenValue;
        });
        return totalFund;
    }

    // getTokenBalanceIn, get total value in fromWei format
    getTokenBalanceIn = (
        partyTokenBalance: ITokenBalanceParty,
        symbol: string,
        price: number,
    ): number => {
        const token = partyTokenBalance[symbol];
        if (!token) {
            return 0;
        }
        const tokenValue =
            this.getTokenBalanceService.formatFromWeiToken(
                token.balance,
                parseInt(token.decimal),
            ) * price;
        return tokenValue;
    };
}
