import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProposalStatusRequest {
    @IsNotEmpty()
    @IsString()
    signature: string;

    @IsNotEmpty()
    @IsString()
    @Expose({ name: 'transaction_hash' })
    transactionHash: string;
}

export class RevertApproveProposalRequest {
    @IsNotEmpty()
    @IsString()
    signature: string;
}
