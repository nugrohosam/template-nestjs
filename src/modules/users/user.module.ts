import { Module } from '@nestjs/common';
import { Web3Module } from 'src/infrastructure/web3/web3.module';
import { UserController } from './controllers/user.controller';
import { GetUserService } from './services/get-user.service';
import { RegisterService } from './services/register.service';

@Module({
    imports: [Web3Module],
    controllers: [UserController],
    providers: [RegisterService, GetUserService],
    exports: [GetUserService],
})
export class UserModule {}
