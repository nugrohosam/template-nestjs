import { PartyTypeEnum } from 'src/common/enums/party.enum';

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
    totalFund?: number;
    minDeposit?: number;
    maxDeposit?: number;
    totalMember?: number;
    distribution: string;
    signature?: string;
    transactionHash?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
