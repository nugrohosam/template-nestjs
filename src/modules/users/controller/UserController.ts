import {
    Body,
    Controller,
    HttpCode,
    Post,
    UseGuards,
    Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { ApiSuccessResponse } from '../../../common/utils/SwaggerUtil';
import { TJwtRequest } from 'src/common/guards/JwtStrategy';
import { LoginRequestDto, LoginResponseDto } from '../dto/LoginDto';
import { UserService } from '../service/UserService';
import { RegisterRequestDto, RegisterResponseDto } from '../dto/RegisterDto';
import { IApiResponse } from 'src/common/interface/ResponseInterface';

@Controller('v1/user')
@ApiExtraModels(LoginResponseDto, RegisterResponseDto)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('/login')
    @HttpCode(200)
    @ApiSuccessResponse(LoginResponseDto)
    async login(@Body() request: LoginRequestDto): Promise<IApiResponse> {
        return {
            data: await this.userService.login(request),
            message: 'Sucess Login',
        };
    }

    @Post('/register')
    @HttpCode(200)
    @ApiSuccessResponse(RegisterResponseDto)
    async register(@Body() request: RegisterRequestDto): Promise<IApiResponse> {
        return {
            data: await this.userService.register(request),
            message: 'Sucess Register',
        };
    }

    @Post('/test')
    @UseGuards(AuthGuard())
    @HttpCode(200)
    @ApiBearerAuth()
    async testEndpoint(@Req() req: TJwtRequest): Promise<IApiResponse> {
        const user = req.user; // this how to access user login
        return {
            data: {
                id: user.id,
                name: user.name,
                userType: user.userType,
            },
            message: 'u are login',
        };
    }
}
