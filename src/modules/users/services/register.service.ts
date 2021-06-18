import { UnprocessableEntityException } from '@nestjs/common';
import { UserModel } from 'src/models/user.model';
import { RegisterRequest } from '../requests/register.request';

export class RegisterService {
    async validateAddressMustUnique(address: string): Promise<void> {
        const user = await UserModel.findOne({
            where: { address },
        });

        if (user)
            throw new UnprocessableEntityException(
                'Failed to create. User token already registered.',
            );
    }

    async register(request: RegisterRequest): Promise<UserModel> {
        await this.validateAddressMustUnique(request.token_address);

        const user = new UserModel();
        user.address = request.token_address;
        await user.save();

        return user;
    }
}
