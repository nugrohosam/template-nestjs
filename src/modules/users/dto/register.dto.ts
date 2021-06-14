import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    MaxLength,
    MinLength,
} from 'class-validator';
import { UserTypeEnum } from 'src/common/enums/user.enum';
import { UserEmailUnique } from 'src/common/rules/user-email-unique.rule';
import { UserModel } from 'src/entities/dblocaltest';

export class RegisterRequestDto {
    @ApiProperty()
    @IsNotEmpty()
    name!: string;

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    @UserEmailUnique()
    email!: string;

    @ApiProperty()
    @IsNotEmpty()
    @MaxLength(32)
    @MinLength(8)
    password!: string;

    @ApiProperty({ name: 'user_type' })
    @IsNotEmpty()
    @MaxLength(32)
    @Expose({ name: 'user_type' })
    @IsEnum(UserTypeEnum)
    userType!: UserTypeEnum;

    generate(user: UserModel): RegisterResponseDto {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            userType: user.userType,
        };
    }
}

export class RegisterResponseDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    email!: string;

    @ApiProperty({ name: 'user_type' })
    userType!: UserTypeEnum;
}
