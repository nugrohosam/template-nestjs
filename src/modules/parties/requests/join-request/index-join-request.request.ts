import { IsEnum, IsOptional } from 'class-validator';
import { JoinRequestStatusEnum } from 'src/common/enums/party.enum';
import { IndexRequest } from 'src/common/request/index.request';

export class IndexJoinRequestRequest extends IndexRequest {
    @IsOptional()
    @IsEnum(JoinRequestStatusEnum)
    status?: JoinRequestStatusEnum;
}
