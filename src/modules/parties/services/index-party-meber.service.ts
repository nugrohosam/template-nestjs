import { Inject } from '@nestjs/common';
import { IPaginateResponse } from 'src/common/interface/index.interface';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { ProfileResponse } from 'src/modules/users/responses/profile.response';
import { IndexPartyMemberRequest } from '../requests/index-party-member.request';
import { GetPartyService } from './get-party.service';

export class IndexPartyMemberService {
    readonly DefaultLimit = 10;
    readonly DefaultOffset = 0;

    constructor(
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
    ) {}

    async getPartyMembers(
        party: PartyModel,
        query: IndexPartyMemberRequest,
    ): Promise<PartyMemberModel[]> {
        return await party.$get('partyMembers', {
            include: {
                model: UserModel,
                as: 'member',
                required: true,
            },
            order: [[query.order ?? 'created_at', query.sort ?? 'desc']],
            limit: query.limit ?? this.DefaultLimit,
            offset: query.offset ?? this.DefaultOffset,
        });
    }

    async getTotalPartyMembers(party: PartyModel): Promise<number> {
        return await party.$count('partyMembers');
    }

    mapPartyMembers(partyMembers: PartyMemberModel[]): ProfileResponse[] {
        return partyMembers.map((partyMember) =>
            ProfileResponse.mapFromUserModel(partyMember.member),
        );
    }

    async fetch(
        partyId: string,
        query: IndexPartyMemberRequest,
    ): Promise<IPaginateResponse<ProfileResponse>> {
        const party = await this.getPartyService.getPartyById(partyId);
        const partyMembers = await this.getPartyMembers(party, query);
        const totalPartyMembers = await this.getTotalPartyMembers(party);
        const response = this.mapPartyMembers(partyMembers);

        return {
            meta: {
                limit: query.limit ?? this.DefaultLimit,
                offset: query.offset ?? this.DefaultOffset,
                total: totalPartyMembers,
            },
            data: response,
        };
    }
}
