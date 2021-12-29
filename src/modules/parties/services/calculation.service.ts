import { UnprocessableEntityException } from '@nestjs/common';
import BN from 'bn.js';

export function addAmount(totalDeposit: BN, amount: BN): BN {
    if (amount.ltn(0)) {
        throw new UnprocessableEntityException(
            'amount cannot be negative number',
        );
    }
    if (amount.isZero()) {
        throw new UnprocessableEntityException('amount cannot be zero');
    }

    return totalDeposit.add(amount);
}

export function substractAmount(totalDeposit: BN, amount: BN): BN {
    if (amount.ltn(0)) {
        throw new UnprocessableEntityException(
            'amount cannot be negative number',
        );
    }
    if (amount.isZero()) {
        throw new UnprocessableEntityException('amount cannot is zero');
    }

    return totalDeposit.sub(amount);
}
