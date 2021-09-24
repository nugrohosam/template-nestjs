import { IsNotEmpty } from 'class-validator';

export class LeavePartyRequest {
    @IsNotEmpty()
    signature: string;
}
