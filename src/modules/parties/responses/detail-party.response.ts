import {
    PartyTypeEnum,
    DistributionTypeEnum,
} from 'src/common/enums/party.enum';
import { Utils } from 'src/common/utils/util';
import { GainPeriod, IParty } from 'src/entities/party.entity';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';

export class DetailPartyResponse
    implements Omit<IParty, 'creatorId' | 'ownerId'>
{
    id: string;
    isActive: boolean;
    isMember: boolean;
    address: string;
    name: string;
    type: PartyTypeEnum;
    purpose: string;
    imageUrl: string;
    bio: string;
    isPublic: boolean;
    isClosed: boolean;
    minDeposit: string;
    maxDeposit: string;
    totalDeposit: string;
    totalFund: string;
    totalMember: number;
    distribution: DistributionTypeEnum;
    distributionDay: number;
    gain: Record<GainPeriod, number>;
    nextDistribution: Date;
    creator: Pick<UserModel, 'id' | 'firstname' | 'lastname' | 'imageUrl'>;
    owner: Pick<UserModel, 'id' | 'firstname' | 'lastname' | 'imageUrl'>;
    projects: Record<string, any> | [];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    joinRequestStatus?: string;
    volume24Hours?: string;

    static mapFromPartyModel(
        party: PartyModel,
        volume?: string,
    ): DetailPartyResponse {
        const creator = party.creator;
        const owner = party.owner;

        return {
            id: party.id,
            isActive: party.isActive,
            isMember: party.isMember,
            address: party.address,
            name: party.name,
            type: party.type,
            purpose: party.purpose,
            imageUrl: party.imageUrl,
            bio: party.bio,
            isPublic: party.isPublic,
            isClosed: party.isClosed,
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
            creator: {
                id: creator.id,
                firstname: creator.firstname,
                lastname: creator.lastname,
                imageUrl: creator.imageUrl,
            },
            owner: {
                id: owner.id,
                firstname: owner.firstname,
                lastname: owner.lastname,
                imageUrl: owner.imageUrl,
            },
            projects: [],
            createdAt: party.createdAt,
            updatedAt: party.updatedAt,
            deletedAt: party.deletedAt,
            joinRequestStatus: party.joinRequestStatus,
            volume24Hours: volume,
        };
    }
}
