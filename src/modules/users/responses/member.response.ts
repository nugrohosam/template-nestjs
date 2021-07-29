import { UserModel } from 'src/models/user.model';

export class MemberResponse {
    id: string;
    address: string;
    username: string;

    static mapFromUserModel(user: UserModel): MemberResponse {
        return {
            id: user.id,
            address: user.address,
            username: user.username,
        };
    }
}
