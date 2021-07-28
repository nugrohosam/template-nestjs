import BN from 'bn.js';
import { Expose } from 'class-transformer';
import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class JoinPartyRequest {
    @IsNotEmpty()
    @IsEthereumAddress()
    @Expose({ name: 'user_address' })
    userAddress: string;

    @IsNotEmpty()
    @Expose({ name: 'initial_deposit' })
    initialDeposit: BN;

    @IsNotEmpty()
    @Expose({ name: 'join_signature' })
    joinSignature: string;
}
