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
    totalDeposit?: string | BN;
    totalFund?: string | BN;
    minDeposit?: string | BN;
    maxDeposit?: string | BN;
    distribution: DistributionTypeEnum;
    distributionDate?: Date;
    signature?: string;
    transactionHash?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
