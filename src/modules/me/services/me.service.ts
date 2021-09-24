import { Injectable } from '@nestjs/common';
import BN from 'bn.js';
import { PartyContract } from 'src/contracts/Party';
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

    async generateWithdrawPlatformSignature(
        partyAddress: string,
        amount: BN,
        distributionPass: number,
    ): Promise<string> {
        const message = this.web3Service.soliditySha3([
            { t: 'address', v: partyAddress },
            { t: 'uint256', v: amount.toString() },
            { t: 'uint256', v: distributionPass },
        ]);
        // TODO: need to removed after testing
        console.log('message[platform-withdraw]: ' + message);
        return await this.web3Service.sign(message);
    }

    async decodeWithdrawEventData({ result: log }: ILogParams): Promise<{
        userAddress: string;
        partyAddress: string;
        amount: BN;
        cut: BN;
        penalty: BN;
    }> {
        const receipt = await this.web3Service.getTransactionReceipt(
            log.transactionHash,
        );

        let decodedLog: { [key: string]: string };
        receipt.logs.some((receiptLog) => {
            if (
                PartyContract.getEventSignature(PartyContract.WithdrawEvent) ==
                receiptLog.topics[0]
            ) {
                decodedLog = this.web3Service.decodeTopicLog(
                    PartyContract.getEventAbi(PartyContract.WithdrawEvent)
                        .inputs,
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
            cut: new BN(decodedLog[3]),
            penalty: new BN(decodedLog[4]),
        };
    }
}
