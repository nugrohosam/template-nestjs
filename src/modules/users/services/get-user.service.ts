import { NotFoundException } from '@nestjs/common';
import { UserModel } from 'src/models/user.model';

export class GetUserService {
    async getUserByAddress(address: string): Promise<UserModel> {
        const user = await UserModel.findOne({
            where: { address },
        });

        if (user === null) throw new NotFoundException('User not found.');
        return user;
    }
    async getUserById(id: string): Promise<UserModel> {
        const user = await UserModel.findOne({
            where: { id },
        });

        if (user === null) throw new NotFoundException('User not found.');
        return user;
    }
}
