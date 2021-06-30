import { Injectable, UnauthorizedException } from '@nestjs/common';
import { config } from 'src/config';
import Web3 from 'web3';
import { Transaction } from 'web3-core';
import { Mixed } from 'web3-utils';

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

    soliditySha3(data: Mixed[]): string {
        return this.web3.utils.soliditySha3(...data);
    }
}
