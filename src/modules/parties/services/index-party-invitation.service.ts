import { FindOptions } from 'sequelize';
import { Op } from 'sequelize';
import { WhereOptions } from 'sequelize/types';
import { IPartyInvitation } from 'src/entities/parti-invitation.entity';
import { PartyInvitationModel } from 'src/models/party-invitation.model';
import { IndexPartyInvitationRequest } from '../requests/index-party-invitation.request';
import { IndexPartyInvitationResponse } from '../responses/index-party-invitation.response';
import {
    PaginationResponse,
    SequelizePaginator,
} from 'sequelize-typescript-paginator';

export class IndexPartyInvitationService {
    getFindOptions(
        partyId: string,
        query: IndexPartyInvitationRequest,
    ): FindOptions<IPartyInvitation> {
        const where: WhereOptions<IPartyInvitation> = {};

        if (query.accepted) {
            where.acceptedAt = {
                [Op.ne]: null,
            };
        }

        return {
            where: { partyId, ...where },
            order: [[query.sort ?? 'created_at', query.order || 'desc']],
        };
    }

    mapInvitationModel(
        invitations: Array<PartyInvitationModel>,
    ): Array<IndexPartyInvitationResponse> {
        return invitations.map((invitation) =>
            IndexPartyInvitationResponse.mapFromPartyInvitationModel(
                invitation,
            ),
        );
    }

    async fetch(
        partyId: string,
        query: IndexPartyInvitationRequest,
    ): Promise<PaginationResponse<IndexPartyInvitationResponse>> {
        const { data, meta } = await SequelizePaginator.paginate(
            PartyInvitationModel,
            {
                perPage: query.perPage ?? 10,
                page: query.page ?? 1,
                options: this.getFindOptions(partyId, query),
            },
        );
        const response = this.mapInvitationModel(data);

        return {
            meta,
            data: response,
        };
    }
}
