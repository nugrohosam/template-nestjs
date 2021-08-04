import { Expose, Transform } from 'class-transformer';
import {
    IsEnum,
    IsEthereumAddress,
    IsNotEmpty,
    IsNumber,
    IsOptional,
} from 'class-validator';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import BN from 'bn.js';
import { ValidationEnum } from 'src/common/enums/validation.enum';
import { BigIntMin } from 'src/common/rules/big-int-min.rule';
import { BigIntMax } from 'src/common/rules/big-int-max.rule';
import { PartyMemberModel } from 'src/models/party-member.model';

export class TransferRequest {
    @IsEthereumAddress()
    @IsNotEmpty()
    @Expose({ name: 'from_address' })
    addressFrom: string;

    @IsEthereumAddress()
    @IsNotEmpty()
    @Expose({ name: 'to_address' })
    addressTo: string;

    @IsNotEmpty()
    @BigIntMin(ValidationEnum.MinWei)
    @BigIntMax(ValidationEnum.MaxWei)
    @Transform(({ value }) => new BN(value.toString()))
    amount: BN;

    @IsNumber()
    @IsNotEmpty()
    @Expose({ name: 'currency_id' })
    currencyId: number;

    @IsNotEmpty()
    @IsEnum(TransactionTypeEnum)
    type: TransactionTypeEnum;

    @IsOptional()
    description?: string;

    @IsNotEmpty()
    @Expose({ name: 'transfer_signature' })
    signature: string;

    @IsNotEmpty()
    @Expose({ name: 'transaction_hash' })
    transactionHash: string;

    static mapFromJoinPartyRequest(
        party: PartyModel,
        user: UserModel,
        deposit: BN,
        signature: string,
        transactionHash: string,
    ): TransferRequest {
        return {
            addressFrom: user.address,
            addressTo: party.address,
            amount: deposit,
            type: TransactionTypeEnum.Deposit,
            description: 'Initial Deposit',
            currencyId: 1, // TODO: still hardcoded to default USDC token
            signature: signature,
            transactionHash: transactionHash,
        };
    }

    static mapFromLeavePartyRequest(
        party: PartyModel,
        user: UserModel,
        member: PartyMemberModel,
        signature: string,
        transactionHash: string,
    ): TransferRequest {
        return {
            addressFrom: party.address,
            addressTo: user.address,
            amount: member.totalFund,
            type: TransactionTypeEnum.Withdraw,
            description: 'Leave Withdraw', // TODO: default description based on type enum
            currencyId: 1, // TODO: still hardcoded to default USDC token
            signature: signature,
            transactionHash: transactionHash,
        };
    }
}
