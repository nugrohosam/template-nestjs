import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyTokenModel } from 'src/models/party-token.model';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { GeneratePlatformSignature } from 'src/modules/commons/providers/generate-platform-signature.service';
import { GenerateSignatureMessage } from 'src/modules/commons/providers/generate-signature-message.service';
import { ISwap0xResponse } from 'src/modules/parties/responses/swap-quote.response';
import { GetPartyService } from 'src/modules/parties/services/get-party.service';
import { GetPartyMemberService } from 'src/modules/parties/services/members/get-party-member.service';
import { PartyService } from 'src/modules/parties/services/party.service';
import { SwapQuoteService } from 'src/modules/parties/services/swap/swap-quote.service';
import { TokenService } from 'src/modules/parties/services/token/token.service';
import { ILogParams } from 'src/modules/parties/types/logData';
import { Repository } from 'typeorm';
import { LeavePartyRequest } from '../requests/leave.request';
import {
    ClosePreparationResponse,
    ILeavedMember,
} from '../responses/close-preparation.response';
import { MeService } from '../services/me.service';

export class ClosePartyApplication {
    constructor(
        @InjectRepository(PartyTokenModel)
        private readonly partyTokenRepository: Repository<PartyTokenModel>,

        private readonly getPartyMemberService: GetPartyMemberService,
        private readonly getPartyServicce: GetPartyService,

        private readonly web3Service: Web3Service,
        private readonly genSignatureMessage: GenerateSignatureMessage,
        private readonly genPlatformSignature: GeneratePlatformSignature,
        private readonly tokenService: TokenService,
        private readonly swapQuoteService: SwapQuoteService,
        private readonly meService: MeService,
        private readonly partyService: PartyService,
    ) {}

    async prepare(
        user: UserModel,
        party: PartyModel,
        { signature }: LeavePartyRequest,
    ): Promise<ClosePreparationResponse> {
        await this.web3Service.validateSignature(
            signature,
            user.address,
            this.genSignatureMessage.closeParty(party),
        );

        if (party.ownerId !== user.id)
            throw new UnauthorizedException(
                'Only owner of the party can close party',
            );

        const partyMembers =
            await this.getPartyMemberService.getPartyMembersOfParty(party.id);

        const leavedMembers: ILeavedMember[] = await Promise.all(
            partyMembers.map(async (partyMember) => {
                const weight = partyMember.weight; // in wei percentage

                const user = await partyMember.getMember;
                return {
                    address: user.address,
                    weight: weight.toString(),
                };
            }),
        );

        const tokens = await this.partyTokenRepository
            .createQueryBuilder('partyToken')
            .where('party_id = :partyId', { partyId: party.id })
            .getMany();
        const defaultToken = await this.tokenService.getDefaultToken();
        const swap = await Promise.all(
            tokens.map(async (token) => {
                const balance = await this.tokenService.getTokenBalance(
                    party.address,
                    token.address,
                );

                let swapResponse: ISwap0xResponse = null;
                if (token.address !== defaultToken.address) {
                    const { data, err } = await this.swapQuoteService.getQuote(
                        defaultToken.address,
                        token.address,
                        balance.toString(),
                    );
                    if (err) {
                        throw new BadRequestException(
                            err.response.data.validationErrors[0].reason,
                        );
                    }
                    swapResponse = data.data;
                }

                return swapResponse;
            }),
        );

        const platformSignature = await this.genPlatformSignature.closeParty(
            user.address,
        );

        return {
            leavedMembers,
            swap,
            platformSignature,
        };
    }

    async sync(logParams: ILogParams): Promise<void> {
        const { partyAddress } = await this.meService.decodeCloseEventData(
            logParams,
        );

        const party = await this.getPartyServicce.getByAddress(
            partyAddress,
            true,
        );
        await this.partyService.delete(party);
    }
}
