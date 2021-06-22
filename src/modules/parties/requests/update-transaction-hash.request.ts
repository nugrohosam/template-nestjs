import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class UpdateTransactionHashRequest {
    @IsNotEmpty()
    @Expose({ name: 'transaction_hash' })
    transactionHash: string;

    @IsNotEmpty()
    @Expose({ name: 'member_signature' })
    memberSignature: string;
}
