import {
    PartyTypeEnum,
    DistributionTypeEnum,
} from 'src/common/enums/party.enum';
import { IParty } from 'src/entities/party.entity';
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
    isPublic: boolean;
    totalFund: string;
    minDeposit: string;
    maxDeposit: string;
    totalMember: number;
    distribution: DistributionTypeEnum;
    creator: Pick<UserModel, 'id' | 'firstname' | 'lastname' | 'imageUrl'>;
    owner: Pick<UserModel, 'id' | 'firstname' | 'lastname' | 'imageUrl'>;
    projects: Record<string, any> | [];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;

    static async mapFromPartyModel(
        party: PartyModel,
        user?: UserModel,
    ): Promise<DetailPartyResponse> {
        return {
            id: party.id,
            isActive: party.isActive,
            isMember: user ? await party.isMember(user) : false,
            address: party.address,
            name: party.name,
            type: party.type,
            purpose: party.purpose,
            imageUrl: party.imageUrl,
            isPublic: party.isPublic,
            totalFund: party.totalFund.toString(),
            minDeposit: party.minDeposit.toString(),
            maxDeposit: party.maxDeposit.toString(),
            totalMember:
                party.totalMember === 0
                    ? party.partyMembers.length ?? 1
                    : party.totalMember,
            distribution: party.distribution,
            creator: {
                id: party.creator.id,
                firstname: party.creator.firstname,
                lastname: party.creator.lastname,
                imageUrl: party.creator.imageUrl,
            },
            owner: {
                id: party.owner.id,
                firstname: party.owner.firstname,
                lastname: party.owner.lastname,
                imageUrl: party.owner.imageUrl,
            },
            projects: [],
            createdAt: party.createdAt,
            updatedAt: party.updatedAt,
            deletedAt: party.deletedAt,
        };
    }
}
