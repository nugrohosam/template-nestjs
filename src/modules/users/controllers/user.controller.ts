import { Body, Controller, Post } from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { Response } from 'src/common/utils/response.util';
import { RegisterRequest } from '../requests/register.request';
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
}
