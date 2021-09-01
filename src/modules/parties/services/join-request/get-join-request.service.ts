import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JoinRequestModel } from 'src/models/join-request.model';
import { Repository } from 'typeorm';

@Injectable()
export class GetJoinRequestService {
    constructor(
        @InjectRepository(JoinRequestModel)
        private readonly repository: Repository<JoinRequestModel>,
    ) {}

    async getById(id: string): Promise<JoinRequestModel> {
        const joinRequest = await this.repository.findOne({
            where: { id },
        });

        if (!joinRequest)
            throw new NotFoundException('Join request not found.');

        return joinRequest;
    }
}
