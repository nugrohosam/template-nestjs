import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeletePartyRequest {
    @IsString()
    @IsNotEmpty()
    @Expose({ name: 'member_signature' })
    memberSignature: string;
}
