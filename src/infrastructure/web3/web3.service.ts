import {
    Injectable,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { config } from 'src/config';
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
        return this.web3.eth.accounts.recover(message, signature);
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
        if (signer !== address)
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
        return await this.web3.eth.getTransactionReceipt(transactionHash);
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
        inputIndex: number,
        validator: string,
    ): Promise<void> {
        const receipt = await this.getTransactionReceipt(transactionHash);

        if (!receipt)
            throw new UnprocessableEntityException(
                'Transaction not found in Network.',
            );

        if (receipt.from !== from)
            throw new UnprocessableEntityException(
                'Transaction not from correct address',
            );

        if (!receipt.status)
            throw new UnprocessableEntityException(
                'Transaction status failed.',
            );

        if (receipt.logs.length <= 0)
            throw new UnprocessableEntityException('Transaction has no logs');

        let decodedLog: { [key: string]: string };
        receipt.logs.some((log) => {
            const eventSignature = this.encodeEventSignature(abiItem);

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

        const identifier = decodedLog[inputIndex.toString()];
        if (identifier !== validator)
            throw new UnprocessableEntityException(
                'Transaction not belongs to validator',
            );
    }
}
