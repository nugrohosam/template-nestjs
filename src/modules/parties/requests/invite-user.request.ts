import { Expose } from 'class-transformer';
import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class InviteUserRequest {
    @IsNotEmpty()
    @IsEthereumAddress()
    @Expose({ name: 'user_address' })
    userAddress: string;

    @IsNotEmpty()
    @Expose({ name: 'invite_signature' })
    inviteSignature: string;
}
