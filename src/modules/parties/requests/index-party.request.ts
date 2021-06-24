import { Expose } from 'class-transformer';
import {
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';
import { OrderDirectionEnum } from 'src/common/enums/index.enum';
import {
    IPaginateRequest,
    ISortRequest,
} from 'src/common/interface/index.interface';

export class IndexPartyRequest implements IPaginateRequest, ISortRequest {
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

    @IsUUID()
    @IsOptional()
    @Expose({ name: 'owner_id' })
    ownerId?: string;
}
