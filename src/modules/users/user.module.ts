import { HttpModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../common/guards/jwt.strategy';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';

@Module({
    imports: [
        HttpModule,
        PassportModule.register({
            defaultStrategy: 'jwt',
            property: 'user',
            session: false,
        }),
        JwtModule.register({
            secret: process.env.JWT_SECRET_KEY,
            signOptions: {
                expiresIn: `${process.env.JWT_EXPIRES_IN}s`,
            },
        }),
    ],
    controllers: [UserController],
    providers: [JwtStrategy, UserService],
})
export class UserModule {}
