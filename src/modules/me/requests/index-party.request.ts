import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { IndexRequest } from 'src/common/request/index.request';

export class IndexMePartyRequest extends IndexRequest {
    @IsOptional()
    @IsBoolean()
    @Expose({ name: 'is_owner' })
    isOwner?: boolean;

    @IsOptional()
    @IsBoolean()
    @Expose({ name: 'is_member' })
    isMember?: boolean;
}
