import { Expose } from 'class-transformer';
import { IsEnum, IsEthereumAddress, IsNotEmpty } from 'class-validator';
import { PartyTypeEnum } from 'src/common/enums/party.enum';

export class CreatePartyRequest {
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
    minDeposit: number;

    @IsNotEmpty()
    @Expose({ name: 'max_deposit' })
    maxDeposit: number;

    @IsNotEmpty()
    distribution: string;

    @IsNotEmpty()
    @IsEthereumAddress()
    @Expose({ name: 'member_address' })
    memberAddress: string;

    @IsNotEmpty()
    @Expose({ name: 'member_signature' })
    memberSignature: string;
}
