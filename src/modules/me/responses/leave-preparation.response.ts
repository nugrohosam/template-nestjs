import { ISwap0xResponse } from 'src/modules/parties/responses/swap-quote.response';

export class LeavePreparationResponse {
    weight: string;
    swap: ISwap0xResponse[];
    distributionPass: number;
    platformSignature: string;
}
