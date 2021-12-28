import { Expose } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { IndexRequest } from 'src/common/request/index.request';

export class IndexMePartyRequest extends IndexRequest {
    @IsOptional()
    @IsBoolean()
    @Expose({ name: 'only_owner' })
    onlyOwner?: boolean;

    @IsOptional()
    @IsBoolean()
    @Expose({ name: 'only_member' })
    onlyMember?: boolean;

    @IsOptional()
    @IsNumber()
    @Expose({ name: 'is_closed' })
    isClosed?: number;
}
