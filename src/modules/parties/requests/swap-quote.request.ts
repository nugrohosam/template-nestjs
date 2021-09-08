import BN from 'bn.js';
import { Expose, Transform } from 'class-transformer';
import { IsEthereumAddress, IsNotEmpty } from 'class-validator';
import { ValidationEnum } from 'src/common/enums/validation.enum';
import { BigIntMax } from 'src/common/rules/big-int-max.rule';
import { BigIntMin } from 'src/common/rules/big-int-min.rule';

export class SwapQuoteRequest {
    @IsNotEmpty()
    @IsEthereumAddress()
    @Expose({ name: 'sell_token' })
    sellToken: string;

    @IsNotEmpty()
    @IsEthereumAddress()
    @Expose({ name: 'buy_token' })
    buyToken: string;

    @IsNotEmpty()
    @BigIntMin(ValidationEnum.MinWei)
    @BigIntMax(ValidationEnum.MaxWei)
    @Transform(({ value }) => value && new BN(value.toString()))
    @Expose({ name: 'sell_amount' })
    sellAmount?: BN;

    @IsNotEmpty()
    @BigIntMin(ValidationEnum.MinWei)
    @BigIntMax(ValidationEnum.MaxWei)
    @Transform(({ value }) => value && new BN(value.toString()))
    @Expose({ name: 'buy_amount' })
    buyAmount?: BN;

    @IsNotEmpty()
    signature: string;
}
