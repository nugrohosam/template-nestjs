import { Expose } from 'class-transformer';
import {
    IsEthereumAddress,
    IsNotEmpty,
    IsNumber,
    IsOptional,
} from 'class-validator';

export class TransferRequest {
    @IsEthereumAddress()
    @IsNotEmpty()
    @Expose({ name: 'from_address' })
    fromAddress: string;

    @IsEthereumAddress()
    @IsNotEmpty()
    @Expose({ name: 'to_address' })
    toAddress: string;

    @IsNumber()
    @IsNotEmpty()
    amount: bigint;

    @IsNumber()
    @IsNotEmpty()
    @Expose({ name: 'currency_id' })
    currencyId: number;

    @IsNotEmpty()
    type: string;

    @IsOptional()
    description: string;

    @IsNotEmpty()
    @Expose({ name: 'transaction_hash' })
    transactionHash: string;

    @IsNotEmpty()
    @Expose({ name: 'transfer_signature' })
    transferSignature: string;
}
