import { Expose, Transform } from 'class-transformer';
import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator';

export class JoinRequestRequest {
    @IsNotEmpty()
    @IsEthereumAddress()
    @Expose({ name: 'user_address' })
    @Transform(({ value }) => value.toLowerCase())
    userAddress: string;

    @IsNotEmpty()
    @IsString()
    signature: string;
}
