import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JoinRequestModel } from 'src/models/join-request.model';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { Repository } from 'typeorm';

@Injectable()
export class JoinRequestValidation {
    constructor(
        @InjectRepository(PartyMemberModel)
        private readonly partyMemberModelRepository: Repository<PartyMemberModel>,
        @InjectRepository(JoinRequestModel)
        private readonly joinRequestModelRepository: Repository<JoinRequestModel>,
    ) {}

    /**
     * validateUser.
     * user must not registered as party member,
     * user can only make one join request
     */
    async userCanRequestJoinParty(
        user: UserModel,
        party: PartyModel,
    ): Promise<void> {
        const memberCount = await this.partyMemberModelRepository
            .createQueryBuilder('partyMembers')
            .leftJoinAndSelect('partyMembers.member', 'member')
            .where('member.id = :userId', { userId: user.id })
            .getCount();

        if (memberCount > 0)
            throw new UnprocessableEntityException(
                'User already a member of party.',
            );

        const joinRequestCount = await this.joinRequestModelRepository
            .createQueryBuilder('joinRequests')
            .where('user_id = :userId', { userId: user.id })
            .where('party_id = :partyId', { partyId: party.id })
            .getCount();

        if (joinRequestCount > 0)
            throw new UnprocessableEntityException(
                'User address already requested.',
            );
    }
}
