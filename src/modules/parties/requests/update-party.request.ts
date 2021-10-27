import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdatePartyRequest {
    @IsOptional()
    @Expose({ name: 'image_url' })
    imageUrl?: string;

    @IsOptional()
    bio?: string;

    @IsNotEmpty()
    signature: string;
}
