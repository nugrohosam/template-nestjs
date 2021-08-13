import { IsEnum, IsOptional } from 'class-validator';
import { MemberStatusEnum } from 'src/common/enums/party.enum';
import { IndexRequest } from 'src/common/request/index.request';

export class IndexPartyMemberRequest extends IndexRequest {
    @IsOptional()
    @IsEnum(MemberStatusEnum)
    status?: MemberStatusEnum;
}
