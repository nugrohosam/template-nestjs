import BN from 'bn.js';
import { Expose } from 'class-transformer';
import {
    IsEnum,
    IsEthereumAddress,
    IsNotEmpty,
    Max,
    Min,
} from 'class-validator';
import {
    DistributionTypeEnum,
    PartyTypeEnum,
} from 'src/common/enums/party.enum';
import { ValidationEnum } from 'src/common/enums/validation.enum';
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
    @Expose({ name: 'min_deposit' })
    @Min(ValidationEnum.MinWei)
    @Max(ValidationEnum.MaxWei)
    minDeposit: BN;

    @IsNotEmpty()
    @Expose({ name: 'max_deposit' })
    @Min(ValidationEnum.MinWei)
    @Max(ValidationEnum.MaxWei)
    maxDeposit: BN;

    @IsNotEmpty()
    @IsEnum(DistributionTypeEnum)
    distribution: DistributionTypeEnum;

    @IsNotEmpty()
    @IsEthereumAddress()
    @Expose({ name: 'member_address' })
    memberAddress: string;

    @IsNotEmpty()
    @Expose({ name: 'member_signature' })
    memberSignature: string;
}
