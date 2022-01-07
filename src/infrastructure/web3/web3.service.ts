import {
    Injectable,
    Logger,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { Utils } from 'src/common/utils/util';
import { config } from 'src/config';
import { PartyContract, PartyEvents } from 'src/contracts/Party';
import Web3 from 'web3';
import { Transaction, TransactionReceipt } from 'web3-core';
import { AbiInput, AbiItem, Mixed } from 'web3-utils';

@Injectable()
export class Web3Service {
    private web3: Web3;

    constructor() {
        this.web3 = new Web3(
            new Web3.providers.HttpProvider(config.web3.httpProvider),
        );
    }

    async recover(signature: string, message: string): Promise<string> {
        try {
            return this.web3.eth.accounts.recover(message, signature);
        } catch (err) {
            throw new UnprocessableEntityException(
                'Signature not a valid signature string',
            );
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    getContractInstance(abi: AbiItem | AbiItem[], address: string) {
        return new this.web3.eth.Contract(abi, address);
    }

    /**
     * Validate signature
     *
     * @param signature signature generated after user sign
     * @param address user address to validate
     * @param message signature message
     * @returns {void}
     */
    async validateSignature(
        signature: string,
        address: string,
        message: string,
    ): Promise<void> {
        if (config.disableSignatureValidation) return;

        const signer = await this.recover(signature, message);
        console.log('address', address);
        console.log('signer', signer);
        if (signer.toLowerCase() !== address.toLowerCase())
            throw new UnauthorizedException('Signature invalid!');
    }

    async sign(message: string): Promise<string> {
        const signature = this.web3.eth.accounts.sign(
            message,
            config.platform.privateKey,
        );

        return signature.signature;
    }

    async getTransaction(transactionHash: string): Promise<Transaction> {
        return await this.web3.eth.getTransaction(transactionHash);
    }

    async getTransactionReceipt(
        transactionHash: string,
    ): Promise<TransactionReceipt> {
        let receipt;
        let trialGetReceipt = 0;
        do {
            await Utils.takeDelay(2000);
            receipt = await this.web3.eth.getTransactionReceipt(
                transactionHash,
            );
            trialGetReceipt++;
        } while (!receipt && trialGetReceipt <= 2);

        if (!receipt) {
            Logger.debug(transactionHash, '[WEB3SERVICE]Receipt not found');
            return;
        }
        return receipt;
    }

    soliditySha3(data: Mixed[]): string {
        return this.web3.utils.soliditySha3(...data);
    }

    encodeEventSignature(abi: AbiItem): string {
        return this.web3.eth.abi.encodeEventSignature(abi);
    }

    decodeTopicLog(
        inputs: AbiInput[],
        hex: string,
        topics: string[],
    ): { [key: string]: string } {
        return this.web3.eth.abi.decodeLog(inputs, hex, topics);
    }

    /**
     * Validate transaction hash is belongs to given 'from' address.
     * It also validate that the transaction belongs to validator.
     *
     * @param transactionHash transaction hash from request
     * @param from address to validate
     * @param abiItem contract event abi item
     * @param inputIndex event input index to validate
     * @param validator validator value to validate value inside inputIndex
     */
    async validateTransaction(
        transactionHash: string,
        from: string,
        abiItem: AbiItem,
        validations: { [key: number]: string },
    ): Promise<boolean> {
        // TODO: need to add different configuration about this
        if (config.nodeEnv === 'local') return true;

        const receipt = await this.getTransactionReceipt(transactionHash);

        if (!receipt)
            throw new UnprocessableEntityException(
                'Transaction not found in Network.',
            );

        if (receipt.from.toLowerCase() !== from.toLowerCase())
            throw new UnprocessableEntityException(
                'Transaction not from correct address',
            );

        if (receipt.logs.length <= 0)
            throw new UnprocessableEntityException('Transaction has no logs');

        let decodedLog: { [key: string]: string };
        const eventSignature = this.encodeEventSignature(abiItem);

        receipt.logs.some((log) => {
            if (eventSignature == log.topics[0]) {
                decodedLog = this.decodeTopicLog(
                    abiItem.inputs,
                    log.data,
                    log.topics.slice(1),
                );

                return true;
            }
        });

        if (!decodedLog)
            throw new UnprocessableEntityException('Fail decode log event');

        for (const inputIndex in validations) {
            const identifier = decodedLog[inputIndex.toString()];
            if (
                identifier.toLowerCase() !==
                validations[inputIndex].toLowerCase()
            )
                throw new UnprocessableEntityException(
                    'Transaction not belongs to validator',
                );
        }

        return receipt.status;
    }

    /**
     * Get decoded log event data from transaction hash
     * based on given event name
     * @param transactionHash
     * @param eventName
     */
    async getDecodedLog(
        transactionHash: string,
        eventName: PartyEvents,
    ): Promise<{ [key: string]: string } | undefined> {
        const receipt = await this.getTransactionReceipt(transactionHash);

        if (!receipt) {
            return;
        }

        let decodedLog: { [key: string]: string };
        receipt.logs.some((receiptLog) => {
            if (
                PartyContract.getEventSignature(eventName) ==
                receiptLog.topics[0]
            ) {
                decodedLog = this.decodeTopicLog(
                    PartyContract.getEventAbi(eventName).inputs,
                    receiptLog.data,
                    receiptLog.topics.slice(1),
                );

                return true;
            }
        });

        return decodedLog;
    }
}
