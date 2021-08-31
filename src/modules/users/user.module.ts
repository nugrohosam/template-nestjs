import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Web3Module } from 'src/infrastructure/web3/web3.module';
import { UserModel } from 'src/models/user.model';
import { UserController } from './controllers/user.controller';
import { GetUserService } from './services/get-user.service';
import { RegisterService } from './services/register.service';
import { UpdateProfileService } from './services/update-profile.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserModel]), Web3Module],
    controllers: [UserController],
    providers: [RegisterService, GetUserService, UpdateProfileService],
    exports: [GetUserService],
})
export class UserModule {}
