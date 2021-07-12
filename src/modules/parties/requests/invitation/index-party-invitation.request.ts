import { Expose } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { OrderDirectionEnum } from 'src/common/enums/index.enum';
import { ISortRequest } from 'src/common/interface/index.interface';
import { PaginationMeta } from 'sequelize-typescript-paginator';

export class IndexPartyInvitationRequest
    implements ISortRequest, Partial<PaginationMeta>
{
    @IsString()
    @IsOptional()
    sort?: string;

    @IsEnum(OrderDirectionEnum)
    @IsOptional()
    order?: OrderDirectionEnum;

    @IsNumber()
    @IsOptional()
    @Expose({ name: 'per_page' })
    perPage?: number;

    @IsNumber()
    @IsOptional()
    page?: number;

    @IsBoolean()
    @IsOptional()
    accepted?: boolean;
}
