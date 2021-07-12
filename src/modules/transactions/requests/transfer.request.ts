import { Expose } from 'class-transformer';
import {
    IsEnum,
    IsEthereumAddress,
    IsNotEmpty,
    IsNumber,
    IsOptional,
} from 'class-validator';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { JoinPartyRequest } from 'src/modules/parties/requests/join-party.request';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';

export class TransferRequest {
    @IsEthereumAddress()
    @IsNotEmpty()
    @Expose({ name: 'from_address' })
    addressFrom: string;

    @IsEthereumAddress()
    @IsNotEmpty()
    @Expose({ name: 'to_address' })
    addressTo: string;

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
    description?: string;

    @IsOptional()
    @IsNotEmpty()
    @Expose({ name: 'transaction_hash' })
    transactionHash?: string;

    @IsNotEmpty()
    @Expose({ name: 'transfer_signature' })
    transferSignature: string;

    static mapFromJoinPartyRequest(
        party: PartyModel,
        user: UserModel,
        request: JoinPartyRequest,
    ): TransferRequest {
        return {
            addressFrom: user.address,
            addressTo: party.address,
            amount: request.initialDeposit,
            type: TransactionTypeEnum.Deposit,
            description: 'Initial Deposit', // TODO: default description based on type enum
            currencyId: 0, // TODO: need to confirm about party currency
            transferSignature: request.joinSignature,
        };
    }
}
