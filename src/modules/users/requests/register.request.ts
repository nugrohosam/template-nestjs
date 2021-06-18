import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class RegisterRequest {
    @IsNotEmpty()
    @IsEthereumAddress()
    token_address: string;
}
