import { InternalServerErrorException } from '@nestjs/common';
import { AbiItem } from 'web3-utils';
import { ContractEvent } from './Event';
import PartyAbi from './PartyAbi.json';

export enum PartyEvents {
    ApprovePayerEvent = 'ApprovePayerEvent',
    ClosePartyEvent = 'ClosePartyEvent',
    CreateEvent = 'CreateEvent',
    CreateProposalEvent = 'CreateProposalEvent',
    DepositEvent = 'DepositEvent',
    JoinEvent = 'JoinEvent',
    LeavePartyEvent = 'LeavePartyEvent',
    Qoute0xSwap = 'Qoute0xSwap',
    WithdrawEvent = 'WithdrawEvent',
}

class Party {
    events: Array<ContractEvent>;

    constructor() {
        const abis = PartyAbi as AbiItem[];
        this.events = abis
            .filter((abi) => abi.type === 'event')
            .map((abi) => new ContractEvent(abi));
    }

    getEvent(name: PartyEvents): ContractEvent {
        const event =
            this.events.filter((event) => event.abi.name === name)[0] ??
            undefined;

        if (!event)
            throw new InternalServerErrorException(
                'No event found with name ' + name,
            );

        return event;
    }

    getEventAbi(name: PartyEvents): AbiItem {
        const event = this.getEvent(name);
        return event.abi;
    }

    getEventSignature(name: PartyEvents): string {
        const event = this.getEvent(name);
        return event.signature;
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PartyContract = new Party();
