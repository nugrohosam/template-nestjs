import { Injectable } from '@nestjs/common';
import BN from 'bn.js';
import { WithdrawEvent } from 'src/contracts/WithdrawEvent';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { ILogParams } from 'src/modules/parties/types/logData';

@Injectable()
export class MeService {
    constructor(private readonly web3Service: Web3Service) {}

    generateDepositSignature(partyName: string, amount: BN): string {
        const message = `I want to deposit money at ${partyName} with amount of ${amount.toString()} mwei`;
        console.log(`message[deposit]: ${message}`);
        return message;
    }

    generateWithdrawSignature(partyName: string, percentage: number): string {
        const message = `I want to withdraw ${percentage}% of my money at ${partyName}`;
        console.log(`message[withdraw]: ${message}`);
        return message;
    }

    async decodeWithdrawEventData({ result: log }: ILogParams): Promise<{
        userAddress: string;
        partyAddress: string;
        amount: BN;
    }> {
        const receipt = await this.web3Service.getTransactionReceipt(
            log.transactionHash,
        );

        let decodedLog: { [key: string]: string };
        receipt.logs.some((receiptLog) => {
            if (WithdrawEvent.signature == receiptLog.topics[0]) {
                decodedLog = this.web3Service.decodeTopicLog(
                    WithdrawEvent.abi.inputs,
                    receiptLog.data,
                    receiptLog.topics.slice(1),
                );

                return true;
            }
        });

        if (Object.keys(decodedLog).length <= 0) return;

        return {
            userAddress: decodedLog[0],
            partyAddress: decodedLog[1],
            amount: new BN(decodedLog[2]),
        };
    }
}
