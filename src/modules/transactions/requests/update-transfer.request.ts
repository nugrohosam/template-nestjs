import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class UpdateTransferRequest {
    @IsNotEmpty()
    @Expose({ name: 'transaction_hash' })
    transactionHash: string;

    @IsNotEmpty()
    @Expose({ name: 'transfer_signature' })
    transferSignature: string;
}
