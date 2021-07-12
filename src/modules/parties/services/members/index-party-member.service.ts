import { Inject } from '@nestjs/common';
import { FindOptions } from 'sequelize';
import { IPartyMember } from 'src/entities/party-member.entity';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { ProfileResponse } from 'src/modules/users/responses/profile.response';
import { IndexPartyMemberRequest } from '../../requests/member/index-party-member.request';
import { GetPartyService } from '../get-party.service';
import {
    PaginationResponse,
    SequelizePaginator,
} from 'sequelize-typescript-paginator';

export class IndexPartyMemberService {
    constructor(
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
    ) {}

    private getFindOptions(
        party: PartyModel,
        query: IndexPartyMemberRequest,
    ): FindOptions<IPartyMember> {
        return {
            where: { partyId: party.id },
            include: {
                model: UserModel,
                as: 'member',
                required: true,
            },
            order: [[query.order ?? 'created_at', query.sort ?? 'desc']],
        };
    }

    private mapPartyMembers(
        partyMembers: PartyMemberModel[],
    ): ProfileResponse[] {
        return partyMembers.map((partyMember) =>
            ProfileResponse.mapFromUserModel(partyMember.member),
        );
    }

    async fetch(
        partyId: string,
        query: IndexPartyMemberRequest,
    ): Promise<PaginationResponse<ProfileResponse>> {
        const party = await this.getPartyService.getPartyById(partyId);
        const { data, meta } = await SequelizePaginator.paginate(
            PartyMemberModel,
            {
                perPage: query.perPage ?? 10,
                page: query.page ?? 1,
                options: this.getFindOptions(party, query),
            },
        );
        const response = this.mapPartyMembers(data);

        return {
            meta,
            data: response,
        };
    }
}
