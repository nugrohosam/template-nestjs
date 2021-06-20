import { Expose } from 'class-transformer';
import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class RegisterRequest {
    @IsNotEmpty()
    @IsEthereumAddress()
    @Expose({ name: 'token_address' })
    tokenAddress: string;

    @IsNotEmpty()
    signature: string;
}
