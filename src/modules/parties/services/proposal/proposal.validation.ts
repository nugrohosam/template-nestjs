import { UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { Repository } from 'typeorm';
import { CreateProposalRequest } from '../../requests/proposal/create-proposal.request';

export class ProposalValidation {
    constructor(
        @InjectRepository(PartyMemberModel)
        private readonly partyMemberRepository: Repository<PartyMemberModel>,
    ) {}

    async validateUserIsPartyMember(
        user: UserModel,
        party: PartyModel,
    ): Promise<void> {
        const member = await this.partyMemberRepository.findOne({
            where: { memberId: user.id, partyId: party.id },
        });

        if (!member)
            throw new UnprocessableEntityException(
                'User is not a party member',
            );
    }

    validateProposalAmount(
        party: PartyModel,
        { amount }: CreateProposalRequest,
    ): void {
        if (amount.gt(party.totalFund))
            throw new UnprocessableEntityException(
                'Proposal amount exceed curent party fund',
            );
    }
}
