import { Expose } from 'class-transformer';
import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator';

export class JoinRequestRequest {
    @IsNotEmpty()
    @IsEthereumAddress()
    @Expose({ name: 'user_address' })
    userAddress: string;

    @IsNotEmpty()
    @IsString()
    signature: string;
}
