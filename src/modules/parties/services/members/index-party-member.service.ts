import { Inject } from '@nestjs/common';
import { FindOptions, WhereOptions } from 'sequelize';
import { IPartyMember } from 'src/entities/party-member.entity';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { IndexPartyMemberRequest } from '../../requests/member/index-party-member.request';
import { GetPartyService } from '../get-party.service';
import {
    PaginationResponse,
    SequelizePaginator,
} from 'sequelize-typescript-paginator';
import { MemberDetailRespose } from '../../responses/member/member-detail.response';
import { MemberStatusEnum } from 'src/common/enums/party.enum';
import { Op } from 'sequelize';

export class IndexPartyMemberService {
    constructor(
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
    ) {}

    private getFindOptions(
        party: PartyModel,
        query: IndexPartyMemberRequest,
    ): FindOptions<IPartyMember> {
        let whereOptions: WhereOptions<PartyMemberModel> = {};

        if (query.status) {
            if (query.status === MemberStatusEnum.InActive) {
                whereOptions = {
                    deletedAt: { [Op.ne]: null },
                };
            } else {
                whereOptions = {
                    deletedAt: null,
                };
            }
        }

        return {
            where: { partyId: party.id, ...whereOptions },
            include: {
                model: UserModel,
                as: 'member',
                required: true,
            },
            order: [[query.sort ?? 'created_at', query.order ?? 'desc']],
        };
    }

    private async mapPartyMembers(
        partyMembers: PartyMemberModel[],
    ): Promise<MemberDetailRespose[]> {
        return Promise.all(
            partyMembers.map(async (partyMember) => {
                return await MemberDetailRespose.mapFromPartyMemberModel(
                    partyMember,
                );
            }),
        );
    }

    async fetch(
        partyId: string,
        query: IndexPartyMemberRequest,
    ): Promise<PaginationResponse<MemberDetailRespose>> {
        const party = await this.getPartyService.getById(partyId);
        const { data, meta } = await SequelizePaginator.paginate(
            PartyMemberModel,
            {
                perPage: query.perPage ?? 10,
                page: query.page ?? 1,
                options: this.getFindOptions(party, query),
            },
        );
        const response = await this.mapPartyMembers(data);

        return {
            meta,
            data: response,
        };
    }
}
