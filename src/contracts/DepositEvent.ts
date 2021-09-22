import { ContractEvent } from './Event';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const DepositEvent = new ContractEvent({
    anonymous: false,
    inputs: [
        {
            indexed: false,
            internalType: 'address',
            name: 'caller',
            type: 'address',
        },
        {
            indexed: false,
            internalType: 'address',
            name: 'partyAddress',
            type: 'address',
        },
        {
            indexed: false,
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
        },
    ],
    name: 'DepositEvent',
    type: 'event',
});
