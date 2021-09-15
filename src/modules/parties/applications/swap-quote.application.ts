import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { ContractSendMethod } from 'web3-eth-contract';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { SwapQuoteRequest } from '../requests/swap-quote.request';
import { SwapSignatureSerivce } from '../services/swap/swap-signature.service';
import { GetPartyService } from 'src/modules/parties/services/get-party.service';
import { SwapQuoteResponse } from '../responses/swap-quote.response';
import { SwapQuoteService } from '../services/swap/swap-quote.service';
import { Injectable } from '@nestjs/common';
import { SwapEvent, eventSignature } from 'src/contracts/SwapEvent.json';
import { abi as ERC20ABI } from 'src/contracts/ERC20.json';
import { TransactionService } from 'src/modules/transactions/services/transaction.service';
import { ILogParams } from '../types/logData';
import { PartyService } from '../services/party.service';
import { TokenService } from '../services/token/token.service';
import { BN } from 'bn.js';
import { AbiItem } from 'web3-utils';
@Injectable()
export class SwapQuoteApplication {
    constructor(
        private readonly web3Service: Web3Service,
        private readonly swapSignatureService: SwapSignatureSerivce,
        private readonly swapQuoteService: SwapQuoteService,
        private readonly getPartyService: GetPartyService,
        private readonly getTokenService: TokenService,
        private readonly transactionService: TransactionService,
        private readonly partyService: PartyService,
    ) {}

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

        const quoteResponse = await this.swapQuoteService.getQuote(
            request.buyToken,
            request.sellToken,
            request.sellAmount.toString(),
        );

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

    async buySync(data: ILogParams) {
        const log = data.result;
        const receipt = await this.web3Service.getTransactionReceipt(
            log.transactionHash,
        );

        let decodedLog;
        receipt.logs.some((log) => {
            if (eventSignature == log.topics[0]) {
                decodedLog = this.web3Service.decodeTopicLog(
                    SwapEvent.inputs,
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
        const partyAddress = await this.getPartyService.getByAddress(address);
        let token = await this.getTokenService.getByAddress(
            swapEventData.buyTokenAddress,
        );
        if (!token) {
            // create token
            const tokenInstance = await this.web3Service.getContractInstance(
                ERC20ABI as AbiItem[],
                swapEventData.buyTokenAddress,
            );
            const contractMethod =
                tokenInstance.methods.name() as ContractSendMethod;
            const name: string = await contractMethod.call();
            console.log('name token', name);
            token = await this.getTokenService.registerToken(
                swapEventData.buyTokenAddress,
                name,
            );
        }
        this.partyService.storeToken(partyAddress, token, new BN(0));
        // Process sync data, save new token value to party token
    }
}
