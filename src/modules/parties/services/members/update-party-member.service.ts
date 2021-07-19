import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyMemberModel } from 'src/models/party-member.model';
import { UpdatePartyMemberRequest } from '../../requests/member/update-party-member.request';
import { GetPartyMemberService } from './get-party-member.service';
import { joinPartyEvent } from 'src/contracts/JoinPartyEvent.json';
import { AbiItem } from 'web3-utils';

@Injectable()
export class UpdatePartyMemberService {
    constructor(
        @Inject(GetPartyMemberService)
        private readonly getPartyMemberService: GetPartyMemberService,
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
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
        const member = await partyMember.$get('member');

        this.validateSignature(request.joinPartySignature, partyMember);
        await this.web3Service.validateTransaction(
            request.transactionHash,
            member.address,
            joinPartyEvent as AbiItem,
            2,
            partyMemberId,
        );

        partyMember.transactionHash = request.transactionHash;
        await partyMember.save();

        return partyMember;
    }
}
