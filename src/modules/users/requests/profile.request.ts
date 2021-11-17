import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IUser } from 'src/entities/user.entity';

export class ProfileRequest implements Omit<IUser, 'address'> {
    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsString()
    firstname?: string;

    @IsOptional()
    @IsString()
    lastname?: string;

    @IsOptional()
    @IsString()
    @Expose({ name: 'image_url' })
    imageUrl?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    about?: string;

    @IsOptional()
    @IsString()
    website?: string;

    @IsOptional()
    @IsString()
    telegram?: string;

    @IsOptional()
    @IsString()
    discord?: string;

    @IsOptional()
    @IsString()
    referal?: string;

    @IsNotEmpty()
    signature: string;
}
