import {
    Injectable,
    Logger,
    UnprocessableEntityException,
} from '@nestjs/common';
import BN from 'bn.js';
import { PartyEvents } from 'src/contracts/Party';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { GetPartyService } from 'src/modules/parties/services/get-party.service';

export interface IDecodeResult {
    userAddress: string;
    partyAddress: string;
    amount: BN;
    cut: BN;
    penalty: BN;
    percentage: BN;
}
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

    generateWithdrawAllSignature(partyName: string): string {
        const message = `I want to withdraw all my money at ${partyName}`;
        console.log(`message[withdraw-all]: ${message}`);
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

    async decodeWithdrawEventData(transactionHash: string): Promise<{
        userAddress: string;
        partyAddress: string;
        amount: BN;
        cut: BN;
        penalty: BN;
        percentage: BN;
    }> {
        const decodedLog = await this.web3Service.getDecodedLog(
            transactionHash,
            PartyEvents.WithdrawEvent,
        );

        if (!decodedLog)
            throw new UnprocessableEntityException('Receipt is null');

        // TODO: this the usual way to get the docoded log. will try to access the input name directly in leave party event.
        const data = {
            userAddress: decodedLog[0],
            percentage: new BN(decodedLog[1]),
            partyAddress: decodedLog[2],
            amount: new BN(decodedLog[3]),
            cut: new BN(decodedLog[4]),
            penalty: new BN(decodedLog[5]),
        };

        Logger.debug(data, 'WithdrawEventData');
        return data;
    }

    async decodeLeaveEventData(transactionHash: string): Promise<{
        partyAddress: string;
        userAddress: string;
        amount: BN;
        cut: BN;
        penalty: BN;
        weight: BN;
    }> {
        const decodedLog = await this.web3Service.getDecodedLog(
            transactionHash,
            PartyEvents.LeavePartyEvent,
        );

        if (!decodedLog)
            throw new UnprocessableEntityException('Receipt is null');
        // TODO: need to test it direct through network. if fail then will change to the usual way like above.
        const data = {
            partyAddress: decodedLog.partyAddress,
            userAddress: decodedLog.userAddress,
            amount: new BN(decodedLog.sent),
            cut: new BN(decodedLog.cut),
            penalty: new BN(decodedLog.penalty),
            weight: new BN(decodedLog.weight),
        };

        Logger.debug(data, 'LeaveEventData');
        return data;
    }

    async decodeCloseEventData(transactionHash: string): Promise<{
        partyAddress: string;
        ownerAddress: string;
    }> {
        const decodedLog = await this.web3Service.getDecodedLog(
            transactionHash,
            PartyEvents.ClosePartyEvent,
        );

        if (!decodedLog)
            throw new UnprocessableEntityException('Receipt is null');

        // TODO: need to test it direct through network. if fail then will change to the usual way like above.
        const data = {
            partyAddress: decodedLog.partyAddress,
            ownerAddress: decodedLog.ownerAddress,
        };

        Logger.debug(data, 'CloseEventData');
        return data;
    }
}
