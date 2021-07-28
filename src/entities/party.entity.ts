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
    totalFund?: BN;
    minDeposit?: BN;
    maxDeposit?: BN;
    totalMember?: number;
    distribution: DistributionTypeEnum;
    signature?: string;
    transactionHash?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
