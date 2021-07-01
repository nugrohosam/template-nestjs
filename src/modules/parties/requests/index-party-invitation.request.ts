import {
    IsBoolean,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { OrderDirectionEnum } from 'src/common/enums/index.enum';
import {
    IPaginateRequest,
    ISortRequest,
} from 'src/common/interface/index.interface';

export class IndexPartyInvitationRequest
    implements ISortRequest, IPaginateRequest
{
    @IsString()
    @IsOptional()
    sort?: string;

    @IsEnum(OrderDirectionEnum)
    @IsOptional()
    order?: OrderDirectionEnum;

    @IsNumber()
    @IsOptional()
    limit?: number;

    @IsNumber()
    @IsOptional()
    offset?: number;

    @IsBoolean()
    @IsOptional()
    accepted?: boolean;
}
