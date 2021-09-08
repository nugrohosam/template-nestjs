import { Expose, Transform } from 'class-transformer';
import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class RegisterRequest {
    @IsNotEmpty()
    @IsEthereumAddress()
    @Expose({ name: 'token_address' })
    @Transform(({ value }) => value.toLowerCase())
    tokenAddress: string;

    @IsNotEmpty()
    signature: string;
}
