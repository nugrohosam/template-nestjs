import { Expose } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';
import {
    OrderDirectionEnum,
    OrderDirectionType,
} from 'src/common/enums/index.enum';
import {
    IPaginationMeta,
    ISortRequest,
} from 'src/common/interface/index.interface';

export class IndexPartyRequest
    implements Partial<IPaginationMeta>, ISortRequest
{
    @IsString()
    @IsOptional()
    sort?: string;

    @IsEnum(OrderDirectionEnum)
    @IsOptional()
    order?: OrderDirectionType;

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
