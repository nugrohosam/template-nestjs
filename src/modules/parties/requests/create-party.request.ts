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
    @Min(100)
    @Max(1000000000000)
    minDeposit: bigint;

    @IsNotEmpty()
    @Expose({ name: 'max_deposit' })
    @Min(100)
    @Max(1000000000000)
    maxDeposit: bigint;

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
