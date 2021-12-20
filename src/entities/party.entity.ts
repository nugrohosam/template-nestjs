import BN from 'bn.js';
import {
    DistributionTypeEnum,
    PartyTypeEnum,
} from 'src/common/enums/party.enum';

export enum GainPeriod {
    Per24Hours = 'per24Hours',
    Per7Days = 'per7Days',
    Per1Month = 'per1Month',
    Per1Year = 'per1Year',
    LifeTime = 'lifeTime',
}
export interface IParty {
    id?: string;
    address?: string;
    name: string;
    type: PartyTypeEnum;
    purpose: string;
    imageUrl?: string;
    bio?: string;
    creatorId: string;
    ownerId: string;
    isPublic: boolean;
    isClosed?: boolean;
    isFeatured?: boolean;
    totalDeposit?: string | BN;
    totalFund?: string | BN;
    minDeposit?: string | BN;
    maxDeposit?: string | BN;
    distribution: DistributionTypeEnum;
    distributionDate?: Date;
    gain: Record<GainPeriod, number>;
    signature?: string;
    transactionHash?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
