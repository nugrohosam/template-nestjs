import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as dotenv from 'dotenv';
import { UserModel } from 'src/models/user.model';

interface IPayload {
    sub?: string;
}

type TJwtGuard = {
    user: UserModel;
};

dotenv.config();

export type TJwtRequest = TJwtGuard & ParameterDecorator;
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET_KEY,
            signOptions: {
                expiresIn: `${process.env.JWT_EXPIRES_IN}s`,
            },
        });
    }

    /**
     * validate token payload with database
     * @param payload
     */
    async validate(payload: IPayload): Promise<UserModel> | null {
        if (payload?.sub) {
            return UserModel.findOne({
                where: { id: payload.sub },
            });
        }
        return null;
    }
}
