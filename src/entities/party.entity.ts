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
    totalFund?: bigint;
    minDeposit?: bigint;
    maxDeposit?: bigint;
    totalMember?: number;
    distribution: DistributionTypeEnum;
    signature?: string;
    transactionHash?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
