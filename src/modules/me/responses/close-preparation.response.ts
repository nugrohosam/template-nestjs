import { ISwap0xResponse } from 'src/modules/parties/responses/swap-quote.response';

export interface ILeavedMember {
    address: string;
    weight: string;
    swap: ISwap0xResponse[];
}

export class ClosePreparationResponse {
    leavedMembers: ILeavedMember[];
    platformSignature: string;
}
