import { Inject, Injectable } from '@nestjs/common';
import { localDatabase } from 'src/infrastructure/database/database.provider';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyMemberModel } from 'src/models/party-member.model';
import { PartyModel } from 'src/models/party.model';
import { TransferRequest } from 'src/modules/transactions/requests/transfer.request';
import { TransferService } from 'src/modules/transactions/services/transfer.service';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { LeavePartyRequest } from '../../requests/member/leave-party.request';
import { GetPartyService } from '../get-party.service';
import { PartyCalculationService } from '../party-calculation.service';
import { GetPartyMemberService } from './get-party-member.service';

@Injectable()
export class LeavePartyService {
    constructor(
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
        @Inject(GetUserService)
        private readonly getUserService: GetUserService,
        @Inject(GetPartyMemberService)
        private readonly getPartyMemberService: GetPartyMemberService,
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
        @Inject(TransferService)
        private readonly transferService: TransferService,
        @Inject(PartyCalculationService)
        private readonly partyCalculationService: PartyCalculationService,
    ) {}

    generateSignatureMessage({ name }: PartyModel): string {
        return `I want to leave ${name} party`;
    }

    async leave(
        partyId: string,
        { userAddress, signature, transactionHash }: LeavePartyRequest,
    ): Promise<PartyMemberModel> {
        const party = await this.getPartyService.getById(partyId);
        const user = await this.getUserService.getUserByAddress(userAddress);
        const member = await this.getPartyMemberService.getByMemberParty(
            user.id,
            party.id,
        );
        const message = this.generateSignatureMessage(party);

        // TODO: need to removed after testing
        console.log('message[leave-party]: ' + message);
        await this.web3Service.validateSignature(
            signature,
            user.address,
            message,
        );

        // TODO: validate transaction hash
        // this.web3Service.validateTransaction(transactionHash, user.address, leavePartyEvent as AbiItem, 0, member.id)

        const dbTransaction = await localDatabase.transaction();

        try {
            const withdraw = await this.transferService.storeTransaction(
                TransferRequest.mapFromLeavePartyRequest(
                    party,
                    user,
                    member,
                    signature,
                    transactionHash,
                ),
                true, // TODO: need to clear this!
                dbTransaction,
            );

            await this.partyCalculationService.withdraw(
                party.address,
                user.address,
                withdraw.amount,
                dbTransaction,
            );

            await member.destroy({ force: true, transaction: dbTransaction });

            party.totalMember -= 1;
            await party.save();

            await dbTransaction.commit();
            return member;
        } catch (err) {
            await dbTransaction.rollback();
            throw err;
        }
    }
}
