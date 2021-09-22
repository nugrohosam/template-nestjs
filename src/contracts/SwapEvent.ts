import { ContractEvent } from './Event';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SwapEvent = new ContractEvent({
    anonymous: false,
    inputs: [
        {
            indexed: false,
            internalType: 'contract IERC20',
            name: 'sellTokenAddress',
            type: 'address',
        },
        {
            indexed: false,
            internalType: 'contract IERC20',
            name: 'buyTokenAddress',
            type: 'address',
        },
        {
            indexed: false,
            internalType: 'address',
            name: 'spender',
            type: 'address',
        },
        {
            indexed: false,
            internalType: 'address',
            name: 'swapTarget',
            type: 'address',
        },
        {
            indexed: false,
            internalType: 'string',
            name: 'transactionType',
            type: 'string',
        },
        {
            indexed: false,
            internalType: 'uint256',
            name: 'sellAmount',
            type: 'uint256',
        },
        {
            indexed: false,
            internalType: 'uint256',
            name: 'buyAmount',
            type: 'uint256',
        },
    ],
    name: 'Qoute0xSwap',
    type: 'event',
});
