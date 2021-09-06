import {
    PartyTypeEnum,
    DistributionTypeEnum,
} from 'src/common/enums/party.enum';
import { Utils } from 'src/common/utils/util';
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
    totalDeposit: string;
    distribution: DistributionTypeEnum;
    distributionDay: number;
    ownerId: string;
    createdAt: Date;
    isActive: boolean;
    nextDistribution: Date;

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
            totalDeposit: party.totalDeposit.toString(),
            totalMember: party.totalMember,
            totalFund: party.totalFund.toString(),
            distribution: party.distribution,
            distributionDay: party.distributionDate?.getDay() ?? 1,
            nextDistribution: Utils.dateOfNearestDay(
                new Date(),
                party.distributionDate?.getDay() ?? 1,
            ),
            ownerId: party.ownerId,
            createdAt: party.createdAt,
            isActive: party.isActive,
        };
    }
}
