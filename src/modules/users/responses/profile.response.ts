import { IUser } from 'src/entities/user.entity';
import { UserModel } from 'src/models/user.model';

export class ProfileResponse implements Omit<IUser, 'address'> {
    id: string;
    username: string;
    address: string;
    firstname: string;
    lastname: string;
    imageUrl: string;
    about: string;
    website: string;

    static mapFromUserModel(user: UserModel): ProfileResponse {
        return {
            id: user.id,
            username: user.username,
            address: user.address,
            firstname: user.firstname,
            lastname: user.lastname,
            imageUrl: user.imageUrl,
            about: user.about,
            website: user.website,
        };
    }
}
