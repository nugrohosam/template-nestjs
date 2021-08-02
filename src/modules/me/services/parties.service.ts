import { Injectable } from '@nestjs/common';
import { FindOptions } from 'sequelize';
import {
    PaginationResponse,
    SequelizePaginator,
} from 'sequelize-typescript-paginator';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { IndexPartyResponse } from 'src/modules/parties/responses/index-party.response';
import { IndexMePartyRequest } from '../requests/index-party.request';

@Injectable()
export class MePartiesService {
    private getFindOptions(
        user: UserModel,
        query: IndexMePartyRequest,
    ): FindOptions<PartyModel> {
        const options: FindOptions<PartyModel> = {
            include: [
                {
                    model: PartyMemberModel,
                    as: 'partyMembers',
                    where: { memberId: user.id },
                },
            ],
            where: { creatorId: user.id },
            order: [[query.sort ?? 'created_at', query.order ?? 'desc']],
        };

        return options;
    }

    private mapMeParties(parties: PartyModel[]): IndexPartyResponse[] {
        return parties.map((party) =>
            IndexPartyResponse.mapFromPartyModel(party),
        );
    }

    async fetch(
        user: UserModel,
        query: IndexMePartyRequest,
    ): Promise<PaginationResponse<IndexPartyResponse>> {
        const options = this.getFindOptions(user, query);
        const result = await SequelizePaginator.paginate(PartyModel, {
            perPage: query.perPage ?? 10,
            page: query.page ?? 1,
            options,
        });
        const data = this.mapMeParties(result.data);

        return { data, meta: result.meta };
    }
}
