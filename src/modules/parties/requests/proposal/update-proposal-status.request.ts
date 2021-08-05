import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ApproveProposalRequest {
    @IsNotEmpty()
    @IsString()
    signature: string;

    @IsOptional()
    @IsString()
    @Expose({ name: 'transaction_hash' })
    transactionHash?: string;
}

export class RejectProposalRequest {
    @IsNotEmpty()
    @IsString()
    signature: string;
}

export class RevertApproveProposalRequest {
    @IsNotEmpty()
    @IsString()
    signature: string;
}
