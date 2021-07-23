import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
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
    imageUrl?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    about?: string;

    @IsOptional()
    @IsString()
    website?: string;

    @IsNotEmpty()
    signature: string;
}
