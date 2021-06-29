import { Expose } from 'class-transformer';
import {
    IsEnum,
    IsEthereumAddress,
    IsNotEmpty,
    IsNumber,
    IsOptional,
} from 'class-validator';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';

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
    @IsEnum(TransactionTypeEnum)
    type: TransactionTypeEnum;

    @IsOptional()
    description: string;

    @IsNotEmpty()
    @Expose({ name: 'transaction_hash' })
    transactionHash: string;

    @IsNotEmpty()
    @Expose({ name: 'transfer_signature' })
    transferSignature: string;
}
