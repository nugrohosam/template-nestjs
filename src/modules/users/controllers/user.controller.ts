import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { ProfileRequest } from '../requests/profile.request';
import { RegisterRequest } from '../requests/register.request';
import { ProfileResponse } from '../responses/profile.response';
import { GetUserService } from '../services/get-user.service';
import { RegisterService } from '../services/register.service';
import { UpdateProfileService } from '../services/update-profile.service';

@Controller('/')
export class UserController {
    constructor(
        private readonly registerService: RegisterService,
        private readonly updateProfileService: UpdateProfileService,
        private readonly getUserService: GetUserService,
    ) {}

    @Post('/register')
    async register(
        @Body() request: RegisterRequest,
    ): Promise<IApiResponse<ProfileResponse>> {
        const user = await this.registerService.register(request);

        return {
            message: 'Success create new user',
            data: ProfileResponse.mapFromUserModel(user),
        };
    }

    @Get('/profile/:address')
    async profile(
        @Param('address') address: string,
    ): Promise<IApiResponse<ProfileResponse>> {
        const user = await this.getUserService.getUserByAddress(address);

        return {
            message: 'Success get user profile',
            data: ProfileResponse.mapFromUserModel(user),
        };
    }

    @Put('/profile/:address')
    async update(
        @Param('address') address: string,
        @Body() request: ProfileRequest,
    ): Promise<IApiResponse<ProfileResponse>> {
        const user = await this.updateProfileService.update(address, request);

        return {
            message: 'Success update user profile',
            data: ProfileResponse.mapFromUserModel(user),
        };
    }
}
