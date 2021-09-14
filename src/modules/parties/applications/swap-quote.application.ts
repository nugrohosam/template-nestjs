import { Web3Service } from 'src/infrastructure/web3/web3.service';

import { Transactional } from 'typeorm-transactional-cls-hooked';
import { SwapQuoteRequest } from '../requests/swap-quote.request';
import { SwapSignatureSerivce } from '../services/swap/swap-signature.service';
import { GetPartyService } from 'src/modules/parties/services/get-party.service';
import { SwapQuoteResponse } from '../responses/swap-quote.response';
import { SwapQuoteService } from '../services/swap/swap-quote.service';
import { Injectable } from '@nestjs/common';
import { IEventLogData } from '../types/logData';
import { SwapEvent, eventSignature } from 'src/contracts/SwapEvent.json';
import { TransactionService } from 'src/modules/transactions/services/transaction.service';
@Injectable()
export class SwapQuoteApplication {
    constructor(
        private readonly web3Service: Web3Service,
        private readonly swapSignatureService: SwapSignatureSerivce,
        private readonly swapQuoteService: SwapQuoteService,
        private readonly getPartyService: GetPartyService,
        private readonly transactionService: TransactionService,
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

    async buySync(data: IEventLogData) {
        if (!data.params) {
            return;
        }
        // GET data from Event
        const log = data.params.result;
        const receipt = await this.web3Service.getTransactionReceipt(
            log.transactionHash,
        );
        // Option 1
        // bisa save terlebih dahulu data fill quote dari FE ke BE
        // simpan segaai preparation data
        // jika event sudah ada validasi dan eksekusi sync party token

        // ambil dari event
        let decodedLog;
        receipt.logs.some((log) => {
            // handle Event Swap
            if (eventSignature == log.topics[0]) {
                decodedLog = this.web3Service.decodeTopicLog(
                    SwapEvent.inputs,
                    log.data,
                    log.topics.slice(1),
                );

                return true;
            }
        });
        const swapEventData = {
            sellTokenAddress: decodedLog[0],
            buyTokenAddress: decodedLog[1],
            transactionType: decodedLog[4],
            sellAmount: decodedLog[5],
            buyAmount: decodedLog[6],
        };
        console.log('swapEventData', swapEventData);
        // Process sync data, save new token value to party token
    }
}
