import { Expose } from 'class-transformer';
import {
    IsBoolean,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';
import { IndexRequest } from 'src/common/request/index.request';

export class BookIndexRequest extends IndexRequest {
    @IsString()
    @IsOptional()
    search?: string;

    @IsUUID()
    @IsOptional()
    @Expose({ name: 'owner_id' })
    ownerId?: string;

    @IsOptional()
    @IsBoolean()
    @Expose({ name: 'is_featured' })
    isFeatured?: boolean;

    @IsOptional()
    @IsNumber()
    @Expose({ name: 'is_closed' })
    isClosed?: number;

    @IsOptional()
    @IsNumber()
    @Expose({ name: 'is_active' })
    isActive?: number;

    @IsOptional()
    name?: string;
}
