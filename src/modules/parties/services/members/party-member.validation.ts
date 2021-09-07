import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BN from 'bn.js';
import { JoinRequestModel } from 'src/models/join-request.model';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { Repository } from 'typeorm';

@Injectable()
export class PartyMemberValidation {
    constructor(
        @InjectRepository(PartyMemberModel)
        private readonly partyMemberRepository: Repository<PartyMemberModel>,
        @InjectRepository(JoinRequestModel)
        private readonly joinRequestRepository: Repository<JoinRequestModel>,
    ) {}

    private async checkOwnerHasJoin(party: PartyModel): Promise<void> {
        const member = await this.partyMemberRepository.findOne({
            where: { partyId: party.id, memberId: party.ownerId },
        });

        if (!member)
            throw new UnprocessableEntityException(
                'Party owner not joined yet.',
            );

        if (!member.depositTransactionId)
            throw new UnprocessableEntityException(
                'Party owner not init deposit yet.',
            );
    }

    private async checkUserIsNotMember(
        user: UserModel,
        party: PartyModel,
    ): Promise<void> {
        const member = await this.partyMemberRepository
            .createQueryBuilder('partyMember')
            .select('id')
            .where('party_id = :partyId', { partyId: party.id })
            .where('member_id = :userId', { userId: user.id })
            .getOne();

        if (member)
            throw new UnprocessableEntityException(
                'User already a member in that party.',
            );
    }

    private async checkUserRequestAccepted(
        user: UserModel,
        party: PartyModel,
    ): Promise<void> {
        if (user.id === party.ownerId) return;

        const joinRequest = await this.joinRequestRepository.findOne({
            where: {
                userId: user.id,
                partyId: party.id,
            },
        });

        if (!joinRequest)
            throw new UnprocessableEntityException(
                'User must request to join first.',
            );

        if (joinRequest.rejectedAt)
            throw new UnprocessableEntityException('Join request rejected.');

        if (!joinRequest.acceptedAt) {
            throw new UnprocessableEntityException(
                'Join request has not accepted yet.',
            );
        }
    }

    async validateUser(user: UserModel, party: PartyModel): Promise<void> {
        if (party.ownerId !== user.id) {
            await this.checkOwnerHasJoin(party);
        }

        await this.checkUserIsNotMember(user, party);

        if (!party.isPublic) {
            await this.checkUserRequestAccepted(user, party);
        }
    }

    validateUserInitialDeposit(party: PartyModel, deposit: BN): void {
        if (deposit.lt(party.minDeposit) || deposit.gt(party.maxDeposit)) {
            throw new UnprocessableEntityException(
                `Deposit must be between ${party.minDeposit} and ${party.maxDeposit}`,
            );
        }
    }
}
