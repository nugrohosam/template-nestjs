import BN from 'bn.js';
import { Expose } from 'class-transformer';
import { IsEthereumAddress, IsNotEmpty, Max, Min } from 'class-validator';
import { ValidationEnum } from 'src/common/enums/validation.enum';

export class JoinPartyRequest {
    @IsNotEmpty()
    @IsEthereumAddress()
    @Expose({ name: 'user_address' })
    userAddress: string;

    @IsNotEmpty()
    @Expose({ name: 'initial_deposit' })
    @Min(ValidationEnum.MinWei)
    @Max(ValidationEnum.MaxWei)
    initialDeposit: BN;

    @IsNotEmpty()
    @Expose({ name: 'join_signature' })
    joinSignature: string;
}
