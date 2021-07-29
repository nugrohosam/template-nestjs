import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProposalStatusRequest {
    @IsNotEmpty()
    @IsString()
    signature: string;
}
