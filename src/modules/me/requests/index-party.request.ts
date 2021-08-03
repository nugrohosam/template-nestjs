import { Expose } from 'class-transformer';
import { IsBooleanString, IsOptional } from 'class-validator';
import { IndexRequest } from 'src/common/request/index.request';

export class IndexMePartyRequest extends IndexRequest {
    @IsOptional()
    @IsBooleanString()
    @Expose({ name: 'is_owner' })
    isOwner?: boolean;
}
