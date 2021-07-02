import { IsNotEmpty } from 'class-validator';

export class AcceptInvitationRequest {
    @IsNotEmpty()
    signature: string;
}
