import { IsEnum, IsOptional } from 'class-validator';
import { MemberStatusEnum } from 'src/common/enums/party.enum';
import { IndexRequest } from 'src/common/request/index.request';
import { PartyModel } from 'src/models/party.model';

export class IndexPartyMemberRequest extends IndexRequest {
    @IsOptional()
    @IsEnum(MemberStatusEnum)
    status?: MemberStatusEnum;
}

export class IndexPartyMemberRequestWithParty extends IndexPartyMemberRequest {
    party: PartyModel;
}
