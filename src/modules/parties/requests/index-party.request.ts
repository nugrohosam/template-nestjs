import { Expose } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';
import { OrderDirectionEnum } from 'src/common/enums/index.enum';
import { ISortRequest } from 'src/common/interface/index.interface';
import { PaginationMeta } from 'sequelize-typescript-paginator';

export class IndexPartyRequest
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

    @IsUUID()
    @IsOptional()
    @Expose({ name: 'owner_id' })
    ownerId?: string;

    @IsString()
    @IsOptional()
    search?: string;

    @IsOptional()
    @IsBoolean()
    @Expose({ name: 'is_featured' })
    isFeatured?: boolean;
}
