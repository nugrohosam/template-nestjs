import { Expose } from 'class-transformer';
import { IsEthereumAddress, IsNotEmpty } from 'class-validator';
import { ValidationEnum } from 'src/common/enums/validation.enum';
import { BigIntMax } from 'src/common/rules/big-int-max.rule';
import { BigIntMin } from 'src/common/rules/big-int-min.rule';

export class SwapQuoteRequest {
    @IsEthereumAddress()
    @Expose({ name: 'sell_token' })
    sellToken: string;

    @IsEthereumAddress()
    @Expose({ name: 'buy_token' })
    buyToken: string;

    @IsNotEmpty()
    @BigIntMin(ValidationEnum.MinWei)
    @BigIntMax(ValidationEnum.MaxWei)
    @Expose({ name: 'sell_amount' })
    sellAmount?: string;

    @IsNotEmpty()
    @BigIntMin(ValidationEnum.MinWei)
    @BigIntMax(ValidationEnum.MaxWei)
    @Expose({ name: 'buy_amount' })
    buyAmount?: string;

    signature: string;
}
