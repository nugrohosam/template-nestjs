import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class KickPartyMemberRequest {
    @IsNotEmpty()
    @IsString()
    @Expose({ name: 'kick_signature' })
    signature: string;
}
