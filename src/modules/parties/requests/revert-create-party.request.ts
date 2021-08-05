import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RevertCreatePartyRequest {
    @IsNotEmpty()
    @IsString()
    @Expose({ name: 'member_signature' })
    signature: string;

    @IsOptional()
    @IsString()
    @Expose({ name: 'transaction_hash' })
    transactionHash?: string;
}
