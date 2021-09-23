import { InternalServerErrorException } from '@nestjs/common';
import { AbiItem } from 'web3-utils';
import { ContractEvent } from './Event';
import PartyAbi from './PartyAbi.json';

class Party {
    readonly ApprovePayerEvent = 'ApprovePayerEvent';
    readonly ClosePartyEvent = 'ClosePartyEvent';
    readonly CreateEvent = 'CreateEvent';
    readonly CreateProposalEvent = 'CreateProposalEvent';
    readonly DepositEvent = 'DepositEvent';
    readonly JoinEvent = 'JoinEvent';
    readonly LeavePartyEvent = 'LeavePartyEvent';
    readonly Qoute0xSwap = 'Qoute0xSwap';
    readonly WithdrawEvent = 'WithdrawEvent';

    events: Array<ContractEvent>;

    constructor() {
        const abis = PartyAbi as AbiItem[];
        this.events = abis
            .filter((abi) => abi.type === 'event')
            .map((abi) => new ContractEvent(abi));
    }

    getEvent(name: string): ContractEvent {
        const event =
            this.events.filter((event) => event.abi.name === name)[0] ??
            undefined;

        if (!event)
            throw new InternalServerErrorException(
                'No event found with name ' + name,
            );

        return event;
    }

    getEventAbi(name: string): AbiItem {
        const event = this.getEvent(name);
        return event.abi;
    }

    getEventSignature(name: string): string {
        const event = this.getEvent(name);
        return event.signature;
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PartyContract = new Party();
