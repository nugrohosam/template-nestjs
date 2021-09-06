import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { IndexRequest } from 'src/common/request/index.request';

export class IndexPartyRequest extends IndexRequest {
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
}
