import { Expose } from 'class-transformer';
import { IsEthereumAddress, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateDeployedPartyDataRequest {
    @IsOptional()
    @IsEthereumAddress()
    @Expose({ name: 'party_address' })
    partyAddress: string;

    @IsNotEmpty()
    @Expose({ name: 'transaction_hash' })
    transactionHash: string;

    @IsNotEmpty()
    @Expose({ name: 'member_signature' })
    memberSignature: string;
}
