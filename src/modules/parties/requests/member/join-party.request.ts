import BN from 'bn.js';
import { Expose, Transform } from 'class-transformer';
import { IsEthereumAddress, IsNotEmpty } from 'class-validator';
import { ValidationEnum } from 'src/common/enums/validation.enum';
import { BigIntMax } from 'src/common/rules/big-int-max.rule';
import { BigIntMin } from 'src/common/rules/big-int-min.rule';

export class JoinPartyRequest {
    @IsNotEmpty()
    @IsEthereumAddress()
    @Expose({ name: 'user_address' })
    userAddress: string;

    @IsNotEmpty()
    @BigIntMin(ValidationEnum.MinWei)
    @BigIntMax(ValidationEnum.MaxWei)
    @Transform(({ value }) => new BN(value.toString()))
    @Expose({ name: 'initial_deposit' })
    initialDeposit: BN;

    @IsNotEmpty()
    @Expose({ name: 'join_signature' })
    joinSignature: string;
}
