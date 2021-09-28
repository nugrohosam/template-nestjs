import { Injectable } from '@nestjs/common';
import BN from 'bn.js';
import { PartyEvents } from 'src/contracts/Party';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { GetPartyService } from 'src/modules/parties/services/get-party.service';
import { ILogParams } from 'src/modules/parties/types/logData';

@Injectable()
export class MeService {
    constructor(
        private readonly web3Service: Web3Service,
        private readonly getPartyService: GetPartyService,
    ) {}

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
        const decodedLog = await this.web3Service.getDecodedLog(
            log.transactionHash,
            PartyEvents.WithdrawEvent,
        );
        if (Object.keys(decodedLog).length <= 0) return;

        // TODO: this the usual way to get the docoded log. will try to access the input name directly in leave party event.
        const data = {
            userAddress: decodedLog[0],
            partyAddress: decodedLog[1],
            amount: new BN(decodedLog[2]),
            cut: new BN(decodedLog[3]),
            penalty: new BN(decodedLog[4]),
        };
        console.log('withdraw event data:');
        console.log(data);
        return data;
    }

    async decodeLeaveEventData({ result: log }: ILogParams): Promise<{
        partyAddress: string;
        userAddress: string;
        amount: BN;
        cut: BN;
        penalty: BN;
    }> {
        const decodedLog = await this.web3Service.getDecodedLog(
            log.transactionHash,
            PartyEvents.LeavePartyEvent,
        );

        // TODO: need to test it direct through network. if fail then will change to the usual way like above.
        const data = {
            partyAddress: decodedLog.partyAddress,
            userAddress: decodedLog.userAddress,
            amount: new BN(decodedLog.amount),
            cut: new BN(decodedLog.cut),
            penalty: new BN(decodedLog.penalty),
        };
        console.log('leave party event data:');
        console.log(data);
        return data;
    }

    async decodeCloseEventData({ result: log }: ILogParams): Promise<{
        partyAddress: string;
        ownerAddress: string;
    }> {
        const decodedLog = await this.web3Service.getDecodedLog(
            log.transactionHash,
            PartyEvents.ClosePartyEvent,
        );

        // TODO: need to test it direct through network. if fail then will change to the usual way like above.
        const data = {
            partyAddress: decodedLog.partyAddress,
            ownerAddress: decodedLog.ownerAddress,
        };
        console.log('close party event data:');
        console.log(data);
        return data;
    }
}
