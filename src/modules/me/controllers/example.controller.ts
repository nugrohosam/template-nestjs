import {
    Controller,
    Get,
} from '@nestjs/common';
import { IApiResponse } from 'src/common/interface/response.interface';
import { UserResponse } from '../responses/example.response';

@Controller('me/parties')
export class MePartiesController {
    constructor(
        // write inject your service here
    ) {}

    @Get()
    async index(
    ): Promise<IApiResponse<UserResponse>> {
        

        return {
            message: 'Success fetch user',
            data: {
                user: 'pl'
            }
        };
    }

}
