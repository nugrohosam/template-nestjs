import { OrderDirectionEnum } from 'src/common/enums/index.enum';
import {
    IPaginateRequest,
    ISortRequest,
} from 'src/common/interface/index.interface';

export class IndexPartyMemberRequest implements IPaginateRequest, ISortRequest {
    sort?: string;
    order?: OrderDirectionEnum;
    limit?: number;
    offset?: number;
}
