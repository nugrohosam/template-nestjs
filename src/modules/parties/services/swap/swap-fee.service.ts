import { Injectable } from '@nestjs/common';
import { config } from 'src/config';
import BN from 'bn.js';

@Injectable()
export class SwapFeeService {
    getFee(amount: BN | string): BN {
        let amountBN: BN;
        if (typeof amount == 'string') {
            amountBN = new BN(amount);
        }
        return amountBN
            .mul(new BN(config.fee.platformFee))
            .div(new BN(config.fee.maxFeePercentage));
    }
}
