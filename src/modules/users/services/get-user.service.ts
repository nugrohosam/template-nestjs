import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from 'src/models/user.model';
import { Repository } from 'typeorm';

export class GetUserService {
    constructor(
        @InjectRepository(UserModel)
        private readonly userRepository: Repository<UserModel>,
    ) {}

    async getUserByAddress(address: string): Promise<UserModel> {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .where('address = :address', { address })
            .getOne();

        if (!user) throw new NotFoundException('User not found.');
        return user;
    }

    async getUserById(id: string): Promise<UserModel> {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .where('id = :id', { id })
            .getOne();

        if (!user) throw new NotFoundException('User not found.');
        return user;
    }
}
