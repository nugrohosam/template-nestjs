import { Expose } from 'class-transformer';
import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class UpdateDeployedPartyDataRequest {
    @IsNotEmpty()
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
