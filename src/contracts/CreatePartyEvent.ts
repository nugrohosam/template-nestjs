import { ContractEvent } from './Event';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const CreatePartyEvent = new ContractEvent({
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
            internalType: 'string',
            name: 'partyName',
            type: 'string',
        },
        {
            indexed: false,
            internalType: 'string',
            name: 'partyId',
            type: 'string',
        },
        {
            indexed: false,
            internalType: 'string',
            name: 'ownerId',
            type: 'string',
        },
    ],
    name: 'CreateEvent',
    type: 'event',
});