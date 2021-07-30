import BN from 'bn.js';
import { Expose, Transform } from 'class-transformer';
import {
    IsDate,
    IsEthereumAddress,
    IsNotEmpty,
    IsNumber,
    IsString,
    IsUrl,
    MinDate,
} from 'class-validator';
import { ValidationEnum } from 'src/common/enums/validation.enum';
import { BigIntMax } from 'src/common/rules/string-number-max.rule copy';
import { BigIntMin } from 'src/common/rules/string-number-min.rule';
import { IProposal } from 'src/entities/proposal.entity';

export class CreateProposalRequest
    implements Omit<IProposal, 'partyId' | 'creatorId'>
{
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsEthereumAddress()
    @Expose({ name: 'contract_address' })
    contractAddress: string;

    @IsNotEmpty()
    @IsUrl()
    @Expose({ name: 'attachment_url' })
    attachmentUrl: string;

    @IsNotEmpty()
    @IsDate()
    @MinDate(new Date())
    @Expose({ name: 'vote_start' })
    voteStart: Date;

    @IsNotEmpty()
    @IsDate()
    @MinDate(new Date())
    @Expose({ name: 'vote_end' })
    voteEnd: Date;

    @IsNotEmpty()
    @IsDate()
    @MinDate(new Date())
    @Expose({ name: 'project_start' })
    projectStart: Date;

    @IsNotEmpty()
    @IsDate()
    @MinDate(new Date())
    @Expose({ name: 'project_end' })
    projectEnd: Date;

    @IsNotEmpty()
    @BigIntMin(ValidationEnum.MinWei)
    @BigIntMax(ValidationEnum.MaxWei)
    @Transform(({ value }) => new BN(value.toString()))
    amount: BN;

    @IsNotEmpty()
    @IsNumber()
    @Expose({ name: 'currency_id' })
    currencyId: number;

    @IsNotEmpty()
    @IsEthereumAddress()
    @Expose({ name: 'signer_address' })
    signerAddress: string;

    @IsNotEmpty()
    @IsString()
    signature: string;
}
