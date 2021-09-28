import { Expose } from 'class-transformer';
import {
    IsEthereumAddress,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';
import { IAnnouncement } from 'src/entities/announcement.entity';

export class CreateAnnouncementRequest implements IAnnouncement {
    partyId: string;

    @IsNotEmpty()
    @IsString()
    @IsEthereumAddress()
    @Expose({ name: 'user_address' })
    userAddress: string;

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
}
