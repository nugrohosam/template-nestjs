import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginRequestDto {
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty()
    email!: string;

    @IsNotEmpty()
    @ApiProperty()
    password!: string;
}

export class LoginResponseDto {
    @ApiProperty()
    name!: string;

    @ApiProperty()
    email!: string;

    @ApiProperty({ name: "user_type"})
    userType!: string;

    @ApiProperty({ name: "access_token"})
    accessToken!: string;
}
