import {
    PartyTypeEnum,
    DistributionTypeEnum,
} from 'src/common/enums/party.enum';
import { Utils } from 'src/common/utils/util';
import { GainPeriod, IParty } from 'src/entities/party.entity';
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
    totalDeposit: string;
    totalFund: string;
    distribution: DistributionTypeEnum;
    distributionDay: number;
    gain: Record<GainPeriod, number>;
    ownerId: string;
    createdAt: Date;
    isActive: boolean;
    nextDistribution: Date;

    static mapFromPartyModel(party: PartyModel): IndexPartyResponse {
        // TODO converting response data can be handled on partyModel
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
            totalFund: party.totalFund.toString(),
            totalMember: party.totalMember,
            distribution: party.distribution,
            distributionDay: party.distributionDate
                ? new Date(party.distributionDate).getDay()
                : 1,
            gain: party.gain,
            nextDistribution: Utils.dateOfNearestDay(
                new Date(),
                party.distributionDate
                    ? new Date(party.distributionDate).getDay()
                    : 1,
            ),
            ownerId: party.ownerId,
            createdAt: party.createdAt,
            isActive: party.isActive,
        };
    }
}
