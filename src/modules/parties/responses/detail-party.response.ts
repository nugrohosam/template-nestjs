import {
    PartyTypeEnum,
    DistributionTypeEnum,
    JoinRequestStatusEnum,
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
    totalDeposit: string;
    totalMember: number;
    distribution: DistributionTypeEnum;
    creator: Pick<UserModel, 'id' | 'firstname' | 'lastname' | 'imageUrl'>;
    owner: Pick<UserModel, 'id' | 'firstname' | 'lastname' | 'imageUrl'>;
    projects: Record<string, any> | [];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    joinRequestStatus?: string;

    static async mapFromPartyModel(
        party: PartyModel,
    ): Promise<DetailPartyResponse> {
        const creator = await party.creator;
        const owner = await party.owner;

        return {
            id: party.id,
            isActive: party.isActive,
            isMember: party.isMember,
            address: party.address,
            name: party.name,
            type: party.type,
            purpose: party.purpose,
            imageUrl: party.imageUrl,
            isPublic: party.isPublic,
            totalFund: party.totalFund.toString(),
            minDeposit: party.minDeposit.toString(),
            maxDeposit: party.maxDeposit.toString(),
            totalDeposit: party.totalDeposit.toString(),
            totalMember: party.totalMember,
            distribution: party.distribution,
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
            joinRequestStatus: JoinRequestStatusEnum.Pending, // TODO: need to be included in get party query
        };
    }
}
