import { Injectable } from '@nestjs/common';
import Web3 from 'web3';
import dotenv from 'dotenv';
import { Transaction } from 'web3-core';
import { Mixed } from 'web3-utils';

dotenv.config();

@Injectable()
export class Web3Service {
    private web3: Web3;

    constructor() {
        this.web3 = new Web3(
            new Web3.providers.HttpProvider(process.env.RPC_SERVER),
        );
    }

    async recover(signature: string, message: string): Promise<string> {
        return this.web3.eth.accounts.recover(message, signature);
    }

    async sign(message: string): Promise<string> {
        const signature = this.web3.eth.accounts.sign(
            message,
            process.env.PLATFORM_PRIVATE_KEY,
        );

        return signature.signature;
    }

    async getTransaction(transactionHash: string): Promise<Transaction> {
        return await this.web3.eth.getTransaction(transactionHash);
    }

    hashMessage(data: Mixed[]): string {
        return this.web3.utils.soliditySha3(...data);
    }
}
