import { IsArray, IsNotEmpty } from 'class-validator';

export class GeckoCoinRequest {
    @IsNotEmpty()
    @IsArray()
    ids: string[];
}
