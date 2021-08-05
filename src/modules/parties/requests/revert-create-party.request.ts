import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class RevertCreatePartyRequest {
    @IsNotEmpty()
    @IsString()
    @Expose({ name: 'member_signature' })
    signature: string;

    @IsNotEmpty()
    @IsString()
    @Expose({ name: 'transaction_hash' })
    transactionHash: string;
}
