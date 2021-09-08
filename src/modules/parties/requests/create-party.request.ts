import BN from 'bn.js';
import { Expose, Transform } from 'class-transformer';
import { IsEnum, IsEthereumAddress, IsNotEmpty } from 'class-validator';
import {
    DistributionTypeEnum,
    PartyTypeEnum,
} from 'src/common/enums/party.enum';
import { ValidationEnum } from 'src/common/enums/validation.enum';
import { BigIntMax } from 'src/common/rules/big-int-max.rule';
import { BigIntMin } from 'src/common/rules/big-int-min.rule';
import { IParty } from 'src/entities/party.entity';

export class CreatePartyRequest
    implements Omit<IParty, 'creatorId' | 'ownerId'>
{
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsEnum(PartyTypeEnum)
    type: PartyTypeEnum;

    @IsNotEmpty()
    purpose: string;

    @IsNotEmpty()
    @Expose({ name: 'is_public' })
    isPublic: boolean;

    @IsNotEmpty()
    @BigIntMin(ValidationEnum.MinWei)
    @BigIntMax(ValidationEnum.MaxWei)
    @Transform(({ value }) => new BN(value.toString()))
    @Expose({ name: 'min_deposit' })
    minDeposit: BN;

    @IsNotEmpty()
    @BigIntMin(ValidationEnum.MinWei)
    @BigIntMax(ValidationEnum.MaxWei)
    @Transform(({ value }) => new BN(value.toString()))
    @Expose({ name: 'max_deposit' })
    maxDeposit: BN;

    @IsNotEmpty()
    @IsEnum(DistributionTypeEnum)
    distribution: DistributionTypeEnum;

    @IsNotEmpty()
    @IsEthereumAddress()
    @Expose({ name: 'member_address' })
    @Transform(({ value }) => value.toLowerCase())
    memberAddress: string;

    @IsNotEmpty()
    @Expose({ name: 'member_signature' })
    memberSignature: string;
}
