import { Expose } from 'class-transformer';
import {
    IsEthereumAddress,
    IsNotEmpty,
    IsNumber,
    IsOptional,
} from 'class-validator';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { JoinPartyRequest } from 'src/modules/parties/requests/join-party.request';

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
    type: string; // TODO: use enum instead

    @IsOptional()
    description: string;

    @IsNotEmpty()
    @Expose({ name: 'transaction_hash' })
    transactionHash: string;

    @IsNotEmpty()
    @Expose({ name: 'transfer_signature' })
    transferSignature: string;

    static mapFromJoinPartyRequest(
        party: PartyModel,
        user: UserModel,
        request: JoinPartyRequest,
    ): TransferRequest {
        return {
            fromAddress: user.address,
            toAddress: party.address,
            amount: request.initialDeposit,
            type: 'deposit', // TODO: use enum instead
            description: 'Initial Deposit', // TODO: default description based on type enum
            currencyId: 0, // TODO: need to confirm about party currency
            transferSignature: request.joinSignature,
            transactionHash: request.transactionHash,
        };
    }
}
