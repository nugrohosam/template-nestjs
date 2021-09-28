import { ISwap0xResponse } from 'src/modules/parties/responses/swap-quote.response';

export interface ILeavedMember {
    address: string;
    weight: string;
}

export class ClosePreparationResponse {
    leavedMembers: ILeavedMember[];
    swap: ISwap0xResponse[];
    platformSignature: string;
}
