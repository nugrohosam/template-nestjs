import { ISwap0xResponse } from 'src/modules/parties/responses/swap-quote.response';
import { PartyTokenResponse } from 'src/modules/parties/responses/token/party-token.response';
import BN from 'bn.js';

export class WithdrawPreparationResponse {
    weight: BN;
    tokens: PartyTokenResponse[];
    swaps: ISwap0xResponse[];
}
