import { ISwap0xResponse } from 'src/modules/parties/responses/swap-quote.response';
import { PartyTokenResponse } from 'src/modules/parties/responses/token/party-token.response';

export class WithdrawPreparationResponse {
    weight: string;
    amount: string;
    tokens: PartyTokenResponse[];
    swap: ISwap0xResponse[];
    distributionPass: number;
    platformSignature: string;
}

export class WithdrawAllPreparationResponse {
    weight: string;
    swap: ISwap0xResponse[];
    distributionPass: number;
    platformSignature: string;
}
