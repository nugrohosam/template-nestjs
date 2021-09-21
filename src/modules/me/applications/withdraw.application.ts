import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyTokenModel } from 'src/models/party-token.model';
import { PartyModel } from 'src/models/party.model';
import { UserModel } from 'src/models/user.model';
import { GetPartyMemberService } from 'src/modules/parties/services/members/get-party-member.service';
import { Repository } from 'typeorm';
import { WithdrawRequest } from '../requests/withdraw.request';
import { WithdrawPreparationResponse } from '../responses/withdraw-preparation.response';
import { MeService } from '../services/me.service';
import { SwapQuoteService } from 'src/modules/parties/services/swap/swap-quote.service';
import { TokenService } from 'src/modules/parties/services/token/token.service';
import { IPartyTokenBalance } from 'src/entities/party-token.entity';

@Injectable()
export class WithdrawApplication {
    constructor(
        @InjectRepository(PartyTokenModel)
        private readonly partyTokenRepository: Repository<PartyTokenModel>,

        private readonly getPartyMemberService: GetPartyMemberService,
        private readonly meService: MeService,
        private readonly web3Service: Web3Service,
        private readonly tokenService: TokenService,
        private readonly swapQuoteService: SwapQuoteService,
    ) {}

    async prepare(
        user: UserModel,
        party: PartyModel,
        request: WithdrawRequest,
    ): Promise<WithdrawPreparationResponse> {
        const partyMember = await this.getPartyMemberService.getByMemberParty(
            user.id,
            party.id,
        );

        await this.web3Service.validateSignature(
            request.signature,
            user.address,
            this.meService.generateWithdrawSignature(
                party.name,
                request.percentage,
            ),
        );

        const weight = partyMember.weight;
        const tokens = await this.partyTokenRepository
            .createQueryBuilder('partyToken')
            .where('party_id = :partyId', { partyId: party.id })
            .getMany();

        const defaultToken = await this.tokenService.getDefaultToken();

        const results = await Promise.all(
            tokens.map(async (token) => {
                const balance = await this.tokenService.getTokenBalance(
                    party.address,
                    token.address,
                );
                const withdrawAmount = balance.mul(weight).divn(1000);
                const swapResponse = await this.swapQuoteService.getQuote(
                    defaultToken.address,
                    token.address,
                    withdrawAmount.toString(),
                );

                return {
                    tokens: {
                        ...token,
                        balance,
                    } as IPartyTokenBalance,
                    swap: swapResponse.data,
                };
            }),
        );

        return {
            weight,
            tokens: results.map((result) => result.tokens),
            swaps: results.map((result) => result.swap),
        };
    }
}
