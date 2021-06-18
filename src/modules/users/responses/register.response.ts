import { UserModel } from 'src/entities';

export class RegisterResponse {
    id: string;
    tokenAddress: string;
    username: string;

    static mapFromUserModel(user: UserModel): RegisterResponse {
        return {
            id: user.id ?? null,
            tokenAddress: user.address,
            username: user.username ?? user.address,
        };
    }
}
