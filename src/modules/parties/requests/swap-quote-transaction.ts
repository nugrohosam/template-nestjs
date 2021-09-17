import BN from 'bn.js';
import { Expose, Transform } from 'class-transformer';
import { IsEthereumAddress, IsNotEmpty } from 'class-validator';
import { ValidationEnum } from 'src/common/enums/validation.enum';
import { BigIntMax } from 'src/common/rules/big-int-max.rule';
import { BigIntMin } from 'src/common/rules/big-int-min.rule';

export class SwapQuoteTransactionRequest {
    @IsNotEmpty()
    @IsEthereumAddress()
    @Expose({ name: 'from' })
    from: string;

    @IsNotEmpty()
    @IsEthereumAddress()
    @Expose({ name: 'to' })
    to: string;

    @IsNotEmpty()
    @IsEthereumAddress()
    @Expose({ name: 'buy_token_address' })
    buyTokenAddress: string;

    @IsNotEmpty()
    @IsEthereumAddress()
    @Expose({ name: 'sell_token_address' })
    sellTokenAddress: string;

    @IsNotEmpty()
    @BigIntMin(ValidationEnum.MinWei)
    @BigIntMax(ValidationEnum.MaxWei)
    @Transform(({ value }) => value && new BN(value.toString()))
    @Expose({ name: 'sell_amount' })
    sellAmount?: BN;

    @IsNotEmpty()
    @Expose({ name: 'transaction_hash' })
    transactionHash: string;

    @IsNotEmpty()
    signature: string;
}
