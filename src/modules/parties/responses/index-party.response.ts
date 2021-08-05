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
    minDeposit: string;
    maxDeposit: string;
    totalMember: number;
    totalFund: string;
    distribution: DistributionTypeEnum;
    ownerId: string;
    createdAt: Date;
    isActive: boolean;

    static async mapFromPartyModel(
        party: PartyModel,
    ): Promise<IndexPartyResponse> {
        return {
            id: party.id,
            name: party.name,
            type: party.type,
            imageUrl: party.imageUrl,
            purpose: party.purpose,
            isPublic: party.isPublic,
            minDeposit: party.minDeposit.toString(),
            maxDeposit: party.maxDeposit.toString(),
            totalMember: party.totalMember,
            totalFund: party.totalFund.toString(),
            distribution: party.distribution,
            ownerId: party.ownerId,
            createdAt: party.createdAt,
            isActive: party.isActive,
        };
    }
}
