interface ISource {
    name: string;
    proportion: string;
}

export interface ISwap0xResponse {
    price: string;
    guaranteedPrice: string;
    to: string;
    data: string;
    value: string;
    gas: string;
    estimatedGas: string;
    gasPrice: string;
    protocolFee: string;
    minimumProtocolFee: string;
    buyTokenAddress: string;
    sellTokenAddress: string;
    buyAmount: string;
    sellAmount: string;
    estimatedGasTokenRefund: string;
    sources: ISource[];
    allowanceTarget: string;
}

export interface ISwap0xError {
    code: number;
    reason: string;
    validationErrors: [
        {
            field: string;
            code: number;
            reason: string;
        },
    ];
}

export class SwapQuoteResponse {
    data: ISwap0xResponse;
    platformSignature: string;
}
