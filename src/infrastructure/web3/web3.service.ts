import { Injectable } from '@nestjs/common';
import Web3 from 'web3';
import dotenv from 'dotenv';

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
}
