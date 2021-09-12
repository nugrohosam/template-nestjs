import BN from 'bn.js';
import {
    DistributionTypeEnum,
    PartyTypeEnum,
} from 'src/common/enums/party.enum';

export interface IParty {
    id?: string;
    address?: string;
    name: string;
    type: PartyTypeEnum;
    purpose: string;
    imageUrl?: string;
    creatorId: string;
    ownerId: string;
    isPublic: boolean;
    isFeatured?: boolean;
    totalFund?: string | BN;
    totalDeposit?: string | BN;
    minDeposit?: string | BN;
    maxDeposit?: string | BN;
    totalMember?: number;
    distribution: DistributionTypeEnum;
    distributionDate?: Date;
    signature?: string;
    transactionHash?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
