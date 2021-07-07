import { IsNotEmpty, IsString } from 'class-validator';

export class DeletePartyRequest {
    @IsString()
    @IsNotEmpty()
    memberSignature: string;
}
