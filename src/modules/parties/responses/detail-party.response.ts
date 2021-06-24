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
    address: string;
    name: string;
    type: PartyTypeEnum;
    purpose: string;
    imageUrl: string;
    isPublic: boolean;
    totalFund: number;
    minDeposit: number;
    maxDeposit: number;
    totalMember: number;
    distribution: DistributionTypeEnum;
    nextDistributionOn: Date;
    creator: Pick<UserModel, 'id' | 'firstname' | 'lastname' | 'imageUrl'>;
    owner: Pick<UserModel, 'id' | 'firstname' | 'lastname' | 'imageUrl'>;
    projects: Record<string, any> | [];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;

    static mapFromPartyModel(party: PartyModel): DetailPartyResponse {
        return {
            id: party.id,
            address: party.address,
            name: party.name,
            type: party.type,
            purpose: party.purpose,
            imageUrl: party.imageUrl,
            isPublic: party.isPublic,
            totalFund: party.totalFund,
            minDeposit: party.minDeposit,
            maxDeposit: party.maxDeposit,
            totalMember: party.totalMember,
            distribution: party.distribution,
            nextDistributionOn: party.getNextDistributionOn(),
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
