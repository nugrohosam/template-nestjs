import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { IndexRequest } from 'src/common/request/index.request';

export class IndexPartyTransactionRequest extends IndexRequest {
    @IsOptional()
    @Expose({ name: 'member_id' })
    memberId?: string;
}
