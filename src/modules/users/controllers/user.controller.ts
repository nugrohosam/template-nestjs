import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    Post,
} from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { Response } from 'src/common/utils/response.util';
import { UserModel } from 'src/models/user.model';
import { RegisterRequest } from '../requests/register.request';
import { ProfileResponse } from '../responses/profile.response';
import { RegisterResponse } from '../responses/register.response';
import { RegisterService } from '../services/register.service';

@Controller('/')
export class UserController {
    constructor(private readonly registerService: RegisterService) {}

    @Post('/register')
    async register(@Body() request: RegisterRequest): Promise<IApiResponse> {
        const user = await this.registerService.register(request);

        return Response.success(
            'Success create new user',
            RegisterResponse.mapFromUserModel(user),
        );
    }

    @Get('/profile/:address')
    async profile(@Param('address') address: string): Promise<IApiResponse> {
        const user = await UserModel.findOne({
            where: { address },
        });
        if (!user) throw new NotFoundException('User not found.');

        return {
            message: 'Success get user profile',
            data: ProfileResponse.mapFromUserModel(user),
        };
    }
}
