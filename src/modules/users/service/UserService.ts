import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Utils } from 'src/common/utils/Utils';
import { UserModel } from 'src/entities/dblocaltest';
import { LoginRequestDto, LoginResponseDto } from '../dto/LoginDto';
import { RegisterRequestDto, RegisterResponseDto } from '../dto/RegisterDto';
import { SignOptions } from 'jsonwebtoken';
import { IUnprocessableResponse } from 'src/common/interface/ResponseInterface';

@Injectable()
export class UserService {
    constructor(private readonly jwt: JwtService) {}

    async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
        const user = await UserModel.findOne({
            where: { email: dto.email },
        });
        if (user.password !== Utils.md5(dto.password)) {
            const message: IUnprocessableResponse = {
                message: 'Email or password wrong',
                data: [],
            };
            throw new UnprocessableEntityException(message);
        }
        return dto.generate(user, await this.createAccessToken(user));
    }

    async register(dto: RegisterRequestDto): Promise<RegisterResponseDto> {
        const user = await UserModel.create({
            name: dto.name,
            email: dto.email,
            password: Utils.md5(dto.password),
            userType: dto.userType,
        });
        return dto.generate(user);
    }

    /**
     * create access token with param usermodel id
     * @param userModel
     */
    private async createAccessToken(userModel: UserModel): Promise<string> {
        const opts: SignOptions = {
            subject: String(userModel.id),
        };

        return this.jwt.signAsync({}, opts);
    }
}
