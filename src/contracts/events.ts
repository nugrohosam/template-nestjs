/* eslint-disable @typescript-eslint/naming-convention */

import { AbiItem } from 'web3-utils';

export const DepositEventAbi: AbiItem = {
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
};
