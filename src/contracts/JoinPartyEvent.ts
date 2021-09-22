import { ContractEvent } from './Event';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const JoinPartyEvent = new ContractEvent({
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
            internalType: 'string',
            name: 'joinPartyId',
            type: 'string',
        },
        {
            indexed: false,
            internalType: 'string',
            name: 'userId',
            type: 'string',
        },
    ],
    name: 'JoinEvent',
    type: 'event',
});
