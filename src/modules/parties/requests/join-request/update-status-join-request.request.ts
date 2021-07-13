import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateStatusJoinRequestRequest {
    @IsNotEmpty()
    @IsBoolean()
    accept: boolean;

    @IsNotEmpty()
    @IsString()
    signature: string;
}
