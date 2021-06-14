import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserModel } from 'src/entities/dblocaltest';

export class LoginRequestDto {
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty()
    email!: string;

    @IsNotEmpty()
    @ApiProperty()
    password!: string;

    generate(user: UserModel, accesToken: string): LoginResponseDto {
        return {
            name: user.name,
            email: user.email,
            userType: user.userType,
            accessToken: accesToken,
        };
    }
}

export class LoginResponseDto {
    @ApiProperty()
    name!: string;

    @ApiProperty()
    email!: string;

    @ApiProperty({ name: 'user_type' })
    userType!: string;

    @ApiProperty({ name: 'access_token' })
    accessToken!: string;
}
