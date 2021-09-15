import BN from 'bn.js';
import { Expose, Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { ValidationEnum } from 'src/common/enums/validation.enum';
import { BigIntMax } from 'src/common/rules/big-int-max.rule';
import { BigIntMin } from 'src/common/rules/big-int-min.rule';

export class SwapQuoteRequest {
    @IsNotEmpty()
    @Expose({ name: 'sell_token' })
    sellToken: string;

    @IsNotEmpty()
    @Expose({ name: 'buy_token' })
    buyToken: string;

    @IsNotEmpty()
    @BigIntMin(ValidationEnum.MinWei)
    @BigIntMax(ValidationEnum.MaxWei)
    @Transform(({ value }) => value && new BN(value.toString()))
    @Expose({ name: 'sell_amount' })
    sellAmount?: BN;

    @IsNotEmpty()
    signature: string;
}
