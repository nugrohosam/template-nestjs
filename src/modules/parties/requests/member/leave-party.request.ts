import { Expose, Transform } from 'class-transformer';
import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator';

export class LeavePartyRequest {
    @IsNotEmpty()
    @IsEthereumAddress()
    @Expose({ name: 'user_address' })
    @Transform(({ value }) => value.toLowerCase())
    userAddress: string;

    @IsNotEmpty()
    @IsString()
    @Expose({ name: 'leave_signature' })
    signature: string;

    @IsNotEmpty()
    @IsString()
    @Expose({ name: 'transaction_hash' })
    transactionHash: string;
}
