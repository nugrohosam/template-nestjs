import { IsEnum, IsOptional } from 'class-validator';
import { IndexPartyRequest } from '../index-party.request';
import { MemberStatusEnum } from 'src/common/enums/party.enum';

export class IndexPartyMemberRequest extends IndexPartyRequest {
    @IsOptional()
    @IsEnum(MemberStatusEnum)
    status?: MemberStatusEnum;
}
