import { OrderDirectionEnum } from 'src/common/enums/index.enum';
import { ISortRequest } from 'src/common/interface/index.interface';
import { PaginationMeta } from 'sequelize-typescript-paginator';
import { Expose } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class IndexPartyMemberRequest
    implements Partial<PaginationMeta>, ISortRequest
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
}
