import { ContractEvent } from './Event';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const LeavePartyEvent = new ContractEvent({
    anonymous: false,
    inputs: [
        {
            indexed: false,
            internalType: 'address',
            name: 'userAddress',
            type: 'address',
        },
        {
            indexed: false,
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
        },
        {
            indexed: false,
            internalType: 'address',
            name: 'partyAddress',
            type: 'address',
        },
    ],
    name: 'LeavePartyEvent',
    type: 'event',
});
