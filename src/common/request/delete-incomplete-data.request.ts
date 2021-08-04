import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteIncompleteDataRequest {
    @IsNotEmpty()
    @IsString()
    signature: string;
}
