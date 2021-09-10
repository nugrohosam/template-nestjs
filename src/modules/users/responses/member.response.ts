import { UserModel } from 'src/models/user.model';

export class MemberResponse {
    id: string;
    username: string;
    firstname: string;
    lastname: string;
    address: string;
    imageUrl: string;

    static mapFromUserModel(user: UserModel): MemberResponse {
        return {
            id: user.id,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            address: user.address,
            imageUrl: user.imageUrl,
        };
    }
}
