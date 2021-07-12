import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PartyMemberModel } from 'src/models/party-member.model';
import { UpdatePartyMemberRequest } from '../../requests/member/update-party-member.request';
import { GetPartyMemberService } from './get-party-member.service';

@Injectable()
export class UpdatePartyMemberService {
    constructor(
        @Inject(GetPartyMemberService)
        private readonly getPartyMemberService: GetPartyMemberService,
    ) {}

    private validateSignature(
        signature: string,
        partyMember: PartyMemberModel,
    ) {
        if (signature !== partyMember.signature)
            throw new UnauthorizedException('Signature not valid');
    }

    async update(
        partyMemberId: string,
        request: UpdatePartyMemberRequest,
    ): Promise<PartyMemberModel> {
        const partyMember = await this.getPartyMemberService.getById(
            partyMemberId,
        );

        this.validateSignature(request.joinPartySignature, partyMember);

        partyMember.transactionHash = request.transactionHash;
        await partyMember.save();

        return partyMember;
    }
}
