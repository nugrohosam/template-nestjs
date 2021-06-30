import {
    PartyTypeEnum,
    DistributionTypeEnum,
} from 'src/common/enums/party.enum';
import { IParty } from 'src/entities/party.entity';
import { PartyModel } from 'src/models/party.model';

export class IndexPartyResponse implements Omit<IParty, 'creatorId'> {
    id: string;
    name: string;
    type: PartyTypeEnum;
    imageUrl: string | null;
    purpose: string;
    isPublic: boolean;
    totalMember: number;
    totalFund: number;
    distribution: DistributionTypeEnum;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;

    static mapFromPartyModel(party: PartyModel): IndexPartyResponse {
        return {
            id: party.id,
            name: party.name,
            type: party.type,
            imageUrl: party.imageUrl,
            purpose: party.purpose,
            isPublic: party.isPublic,
            totalMember: party.totalMember,
            totalFund: party.totalFund,
            distribution: party.distribution,
            ownerId: party.ownerId,
            createdAt: party.createdAt,
            updatedAt: party.updatedAt,
        };
    }
}
