import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { SwapQuoteRequest } from '../requests/swap-quote.request';
import { SwapSignatureSerivce } from '../services/swap/swap-signature.service';
import { GetPartyService } from 'src/modules/parties/services/get-party.service';
import { SwapQuoteResponse } from '../responses/swap-quote.response';
import { SwapQuoteService } from '../services/swap/swap-quote.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { TransactionService } from 'src/modules/transactions/services/transaction.service';
import { ILogParams } from '../types/logData';
import { PartyService } from '../services/party.service';
import { TokenService } from '../services/token/token.service';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { GetTransactionService } from 'src/modules/transactions/services/get-transaction.service';
import { SwapQuoteTransactionRequest } from '../requests/swap-quote-transaction';
import { UserModel } from 'src/models/user.model';
import { PartyContract, PartyEvents } from 'src/contracts/Party';
import { Utils } from 'src/common/utils/util';
import { SwapTransactionModel } from 'src/models/swap-transaction.model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PartyGainService } from '../services/party-gain/party-gain.service';
import { PartyFundService } from '../services/party-fund/party-fund.service';
import { GetTokenPriceService } from '../services/token/get-token-price.service';
import { config } from 'src/config';
import { BN } from 'bn.js';

@Injectable()
export class SwapQuoteApplication {
    constructor(
        @InjectRepository(SwapTransactionModel)
        private readonly swapTransactionRepository: Repository<SwapTransactionModel>,
        private readonly web3Service: Web3Service,
        private readonly swapSignatureService: SwapSignatureSerivce,
        private readonly swapQuoteService: SwapQuoteService,
        private readonly getPartyService: GetPartyService,
        private readonly tokenService: TokenService,
        private readonly transactionService: TransactionService,
        private readonly getTransactionService: GetTransactionService,
        private readonly partyService: PartyService,
        private readonly partyGainService: PartyGainService,
        private readonly partyFundService: PartyFundService,
        private readonly tokenPrice: GetTokenPriceService,
    ) {}

    @Transactional()
    async transaction(
        request: SwapQuoteTransactionRequest,
        user: UserModel,
    ): Promise<string> {
        await this.web3Service.validateSignature(
            request.signature,
            user.address,
            this.swapSignatureService.generateSwapBuySignature(
                request.buyTokenAddress,
                request.sellTokenAddress,
                request.sellAmount.toString(),
            ),
        );

        let token = await this.tokenService.getByAddress(
            request.buyTokenAddress,
        );
        if (!token) {
            token = await this.tokenService.registerToken(
                request.buyTokenAddress,
            );
        }
        const transaction = await this.getTransactionService.getByTx(
            request.transactionHash,
            TransactionTypeEnum.Swap,
            false,
        );
        if (transaction) {
            return 'Transaction has been created before';
        }

        const swapTx = this.transactionService.store({
            addressFrom: request.from,
            addressTo: request.to,
            type: TransactionTypeEnum.Swap,
            currencyId: token.id,
            amount: request.sellAmount,
            description: `Swap to buy token with address ${request.to}`,
            signature: request.signature,
            transactionHash: request.transactionHash,
            transactionHashStatus: false,
        });

        const chargeTx = this.transactionService.store({
            addressFrom: request.from,
            addressTo: request.to,
            type: TransactionTypeEnum.Charge,
            currencyId: token.id,
            amount: Utils.getPlatformFee(request.sellAmount),
            description: `Charge Swap to buy token with address ${request.to}`,
            signature: request.signature,
            transactionHash: request.transactionHash,
            transactionHashStatus: false,
        });
        await Promise.all([swapTx, chargeTx]);
        return 'Create Transaction success';
    }

    @Transactional()
    async buy(
        partyId: string,
        request: SwapQuoteRequest,
    ): Promise<SwapQuoteResponse> {
        const party = await this.getPartyService.getById(partyId);
        // TODO need to validate that request.address is has permission to buy
        // because user will initiate transaction using a party name
        // for now at monarki governance, only to be validated as owner of the party
        await this.web3Service.validateSignature(
            request.signature,
            party.owner.address,
            this.swapSignatureService.generateSwapBuySignature(
                request.buyToken,
                request.sellToken,
                request.sellAmount.toString(),
            ),
        );

        const { data: quoteResponse, err } =
            await this.swapQuoteService.getQuote(
                request.buyToken,
                request.sellToken,
                request.sellAmount.toString(),
            );
        console.log('quote response data', quoteResponse);
        console.log('quote response err', err);
        if (err) {
            throw new BadRequestException(
                err.response.data.validationErrors[0].reason,
            );
        }

        const quote = quoteResponse.data;
        const platformSignature =
            await this.swapSignatureService.generatePlatformSignature(
                quote.sellTokenAddress,
                quote.buyTokenAddress,
                quote.allowanceTarget,
                quote.to,
                quote.sellAmount,
                quote.buyAmount,
            );

        return {
            data: quote,
            platformSignature,
        };
    }

    async buySync(data: ILogParams): Promise<void> {
        const log = data.result;
        const receipt = await this.web3Service.getTransactionReceipt(
            log.transactionHash,
        );

        let decodedLog;
        receipt.logs.some((log) => {
            if (
                PartyContract.getEventSignature(PartyEvents.Qoute0xSwap) ==
                log.topics[0]
            ) {
                decodedLog = this.web3Service.decodeTopicLog(
                    PartyContract.getEventAbi(PartyEvents.Qoute0xSwap).inputs,
                    log.data,
                    log.topics.slice(1),
                );

                return true;
            }
        });

        const address = log.address;
        const swapEventData = {
            sellTokenAddress: decodedLog[0],
            buyTokenAddress: decodedLog[1],
            transactionType: decodedLog[4],
            sellAmount: decodedLog[5],
            buyAmount: decodedLog[6],
        };
        const party = await this.getPartyService.getByAddress(address);
        let token = await this.tokenService.getByAddress(
            swapEventData.buyTokenAddress,
        );
        if (!token) {
            token = await this.tokenService.registerToken(
                swapEventData.buyTokenAddress,
            );
        }
        await this.partyService.storeToken(party, token);

        let usd = new BN(0);
        if (swapEventData.sellTokenAddress != config.defaultToken.address) {
            // get symbol by address at party token
            const partyToken = await this.partyService.getPartyTokenByAddress(
                swapEventData.sellTokenAddress,
            );
            console.log('party token => ', partyToken); // TODO for debugging

            const decimal = await this.tokenService.getTokenDecimal(
                swapEventData.sellTokenAddress,
            );
            console.log('decimal => ', decimal); // TODO for debugging

            const marketValue = await this.tokenPrice.getMarketValue([
                partyToken.symbol,
            ]);
            console.log('marketvalue => ', marketValue); // TODO for debugging

            usd = usd.addn(
                marketValue[partyToken.symbol].current_price /
                    10 ** Number(decimal),
            );
        } else {
            usd = usd.addn(
                swapEventData.sellAmount / 10 ** config.calculation.usdDecimal,
            );
        }
        console.log('usd => ', usd); // TODO for debugging

        const swapTransaction = this.swapTransactionRepository.create({
            partyId: party.id,
            buyAmount: swapEventData.buyAmount,
            sellAmount: swapEventData.sellAmount,
            tokenFrom: swapEventData.sellTokenAddress,
            tokenTarget: swapEventData.buyTokenAddress,
            transactionHash: log.transactionHash,
            usd: usd,
        });

        await Promise.all([
            this.transactionService.updateTxHashStatus(
                log.transactionHash,
                true,
            ),
            this.swapTransactionRepository.save(swapTransaction),
            this.partyGainService.updatePartyGain(party),
            this.partyFundService.updatePartyFund(party),
        ]);
    }
}
