import { HttpService } from '@nestjs/axios';
import { AxiosResponse, AxiosError } from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { config } from 'src/config';
import { PartyModel } from 'src/models/party.model';
import { GeckoCoinService } from 'src/modules/commons/providers/gecko-coin.service';
import { InjectRepository } from '@nestjs/typeorm';
import { PartyTokenModel } from 'src/models/party-token.model';
import { Repository } from 'typeorm';
import { GetTokenBalanceService } from '../../utils/get-token-balance.util';
import { BN } from 'bn.js';
import { CurrencyModel } from 'src/models/currency.model';

export interface IFetchMarketsParams {
    vs_currency: string;
    ids?: string;
    category?: string;
    order?: string;
    per_page?: number;
    page?: number;
    sparkline?: boolean;
    price_change_percentage?: string;
}

export interface ITokenBalanceParty {
    [key: string]: {
        balance: string;
        decimal: string;
    };
}
export interface IMarketValue {
    [key: string]: IFetchMarketsResp;
}

export interface IFetchMarketsResp {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    fully_filuted_valuation: number;
    total_volume: number;
    high24h: number;
    low24h: number;
    price_change24h: number;
    price_change_percentage24h: number;
    market_cap_change24h: number;
    market_cap_change_percentage24h: number;
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
    ath: number;
    ath_change_percentage: number;
    ath_date: Date;
    atl: number;
    atl_change_percentage: number;
    atl_date: Date;
    last_updated: Date;
    price_change_percentage14_in_currency?: number;
    price_change_percentage1h_in_currency?: number;
    price_change_percentage1y_in_currency?: number;
    price_change_percentage200d_in_currency?: number;
    price_change_percentage24h_in_currency?: number;
    price_change_percentage30d_in_currency?: number;
    price_change_percentage7d_in_currency?: number;
    error?: string;
}

@Injectable()
export class GetTokenPriceService {
    constructor(
        private readonly httpService: HttpService,
        private readonly geckoCoinService: GeckoCoinService,
        @InjectRepository(PartyTokenModel)
        private readonly partyTokenRepository: Repository<PartyTokenModel>,
        private readonly getTokenBalanceService: GetTokenBalanceService,
        @InjectRepository(CurrencyModel)
        private readonly currencyRepository: Repository<CurrencyModel>,
    ) {}

    async fetchMarketValue(
        params: IFetchMarketsParams,
    ): Promise<AxiosResponse<IFetchMarketsResp[]>> {
        return this.httpService
            .get<IFetchMarketsResp[]>(`${config.api.gecko}/coins/markets`, {
                params,
            })
            .toPromise();
    }

    async getAllMarketValue(): Promise<IMarketValue | undefined> {
        const listTokenParties = await this.currencyRepository
            .createQueryBuilder('currency')
            .getMany();
        // TODO: change symbol to id
        const listGeckoTokenIds = listTokenParties.map(
            (item) => item.geckoTokenId,
        );
        const marketValue = await this.getMarketValue(listGeckoTokenIds);
        if (!marketValue) throw new Error('Gecko Market value fetch error');
        return marketValue;
    }

    async getMarketValue(
        tokensId: string[],
        currency: { name: string; decimal: number } = {
            name: 'usd',
            decimal: config.calculation.usdDecimal,
        },
    ): Promise<IMarketValue | undefined> {
        // TODO: change symbol to id
        const coins = await this.geckoCoinService.getGeckoCoins(tokensId);

        if (!coins.length) return undefined;
        const ids = coins.map((coin) => coin.id).join(',');
        const marketValueResp: AxiosResponse<IFetchMarketsResp[]> =
            await this.fetchMarketValue({
                vs_currency: currency.name,
                ids: ids,
                page: 1,
                per_page: 100,
                price_change_percentage: '1h,24h,7d',
            }).catch((error: AxiosError) => {
                console.log('fetch gecko market', error);
                return undefined;
            });
        const marketValue = {};
        // TODO: change symbol to id key
        marketValueResp.data.forEach((item) => {
            marketValue[item.id] = item;
        });
        return marketValue;
    }

    // TODO: change symbol to id // belum tau
    async getPartyTokenValue(
        party: PartyModel,
        marketValue: IMarketValue,
        currency: { name: string; decimal: number } = {
            name: 'usd',
            decimal: config.calculation.usdDecimal,
        },
    ): Promise<string> {
        try {
            if (!party.address) {
                return '0';
            }
            const partyTokens = await this.partyTokenRepository
                .createQueryBuilder('partyToken')
                .where('party_id = :partyId', { partyId: party.id })
                .getMany();
            // map to get list token symbol
            const tokensId = partyTokens.map((item) => {
                return item.geckoTokenId;
            });
            if (!tokensId.length) {
                return '0';
            }
            const partyToken: ITokenBalanceParty = {};
            // set contract token data to token balance party
            const promiseToken = partyTokens.map(async (item) => {
                const tokenBalance =
                    await this.getTokenBalanceService.getTokenBalance(
                        item.address,
                        party.address,
                    );

                return (partyToken[item.geckoTokenId] = {
                    balance: tokenBalance.balance,
                    decimal: tokenBalance.decimal,
                });
            });
            await Promise.all(promiseToken);
            // ---- normalizing data -----
            // -----------------------------
            let totalFund = new BN(0);
            // iterate all coin from party which fetch before to calculate total value
            partyTokens.forEach((item) => {
                const tokenValue = this.getTokenBalanceIn(
                    partyToken,
                    item.geckoTokenId,
                    marketValue[item.geckoTokenId].current_price *
                        currency.decimal,
                );
                totalFund = totalFund.addn(tokenValue);
            });
            return totalFund.toString(); // big int detail 4 exponent
        } catch (err) {
            Logger.error('[GET-PARTY-TOKEN-VALUE]', err);
            throw err;
        }
    }

    // TODO: change symbol to id
    // getTokenBalanceIn, get total value in ether value
    // for example using usd currency
    // 1 usd equal 100
    getTokenBalanceIn = (
        partyTokenBalance: ITokenBalanceParty,
        tokenId: string,
        price: number,
    ): number => {
        const token = partyTokenBalance[tokenId];
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
