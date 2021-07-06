import { Module } from '@nestjs/common';
import { Web3Module } from 'src/infrastructure/web3/web3.module';
import { UserController } from './controllers/user.controller';
import { GetUserService } from './services/get-user.service';
import { RegisterService } from './services/register.service';
import { UpdateProfileService } from './services/update-profile.service';

@Module({
    imports: [Web3Module],
    controllers: [UserController],
    providers: [RegisterService, GetUserService, UpdateProfileService],
    exports: [GetUserService],
})
export class UserModule {}
