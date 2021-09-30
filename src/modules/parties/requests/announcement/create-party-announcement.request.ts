import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IAnnouncement } from 'src/entities/announcement.entity';

export class CreateAnnouncementRequest implements IAnnouncement {
    partyId: string;

    @IsNotEmpty()
    @IsString()
    signature: string;

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    body: string;

    @IsOptional()
    @IsString()
    link?: string;

    @IsOptional()
    @IsString()
    @Expose({ name: 'image_url' })
    imageUrl: string;
}
