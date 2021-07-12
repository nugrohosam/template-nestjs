import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePartyMemberRequest {
    @IsNotEmpty()
    @IsString()
    @Expose({ name: 'join_party_signature' })
    joinPartySignature: string;

    @IsNotEmpty()
    @IsString()
    @Expose({ name: 'transaction_hash' })
    transactionHash: string;
}
