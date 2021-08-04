import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteIncompleteData {
    @IsString()
    @IsNotEmpty()
    @Expose({ name: 'join_party_signature' })
    signature: string;
}
