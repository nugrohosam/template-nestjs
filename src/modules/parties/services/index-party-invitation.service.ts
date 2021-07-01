import { Op } from 'sequelize';
import { WhereOptions } from 'sequelize/types';
import { IPaginateResponse } from 'src/common/interface/index.interface';
import { IPartyInvitation } from 'src/entities/parti-invitation.entity';
import { PartyInvitationModel } from 'src/models/party-invitation.model';
import { IndexPartyInvitationRequest } from '../requests/index-party-invitation.request';
import { IndexPartyInvitationResponse } from '../responses/index-party-invitation.response';

export class IndexPartyInvitationService {
    readonly DefaultLimit = 10;
    readonly DefaultOffset = 0;

    prepareFilterOptions(
        query: IndexPartyInvitationRequest,
    ): WhereOptions<IPartyInvitation> {
        const whereOptions: WhereOptions<IPartyInvitation> = {};

        if (query.accepted) {
            whereOptions.acceptedAt = {
                [Op.ne]: null,
            };
        }

        return whereOptions;
    }

    async getInvitations(
        partyId: string,
        query: IndexPartyInvitationRequest,
    ): Promise<Array<PartyInvitationModel>> {
        return await PartyInvitationModel.findAll({
            where: { partyId, ...this.prepareFilterOptions(query) },
            order: [[query.sort ?? 'created_at', query.order || 'desc']],
            limit: query.limit,
            offset: query.offset,
        });
    }

    async getTotalInvitations(
        partyId: string,
        query: IndexPartyInvitationRequest,
    ): Promise<number> {
        return await PartyInvitationModel.count({
            where: { partyId, ...this.prepareFilterOptions(query) },
        });
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
    ): Promise<IPaginateResponse<IndexPartyInvitationResponse>> {
        query.limit = query.limit ?? this.DefaultLimit;
        query.offset = query.offset ?? this.DefaultOffset;

        const invitations = await this.getInvitations(partyId, query);
        const total = await this.getTotalInvitations(partyId, query);
        const response = this.mapInvitationModel(invitations);

        return {
            meta: {
                limit: query.limit,
                offset: query.offset,
                total: total,
            },
            data: response,
        };
    }
}
