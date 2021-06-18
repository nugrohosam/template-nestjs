import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { RegisterService } from './services/register.service';

@Module({
    controllers: [UserController],
    providers: [RegisterService],
})
export class UserModule {}
