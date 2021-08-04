import {
    Inject,
    Injectable,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyMemberModel } from 'src/models/party-member.model';
import { UpdatePartyMemberRequest } from '../../requests/member/update-party-member.request';
import { GetPartyMemberService } from './get-party-member.service';
import { joinPartyEvent } from 'src/contracts/JoinPartyEvent.json';
import { AbiItem } from 'web3-utils';
import { localDatabase } from 'src/infrastructure/database/database.provider';
import { TransferService } from 'src/modules/transactions/services/transfer.service';
import { TransferRequest } from 'src/modules/transactions/requests/transfer.request';
import { DeleteIncompleteData } from '../../requests/member/delete-incomplete-data.request';

@Injectable()
export class UpdatePartyMemberService {
    constructor(
        @Inject(GetPartyMemberService)
        private readonly getPartyMemberService: GetPartyMemberService,
        @Inject(TransferService)
        private readonly transferService: TransferService,
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
        const party = await partyMember.$get('party');

        this.validateSignature(request.joinPartySignature, partyMember);
        await this.web3Service.validateTransaction(
            request.transactionHash,
            member.address,
            joinPartyEvent as AbiItem,
            2,
            partyMemberId,
        );

        const dbTransaction = await localDatabase.transaction();
        try {
            partyMember.transactionHash = request.transactionHash;
            await partyMember.save({ transaction: dbTransaction });

            const depositTransaction =
                await this.transferService.storeTransaction(
                    TransferRequest.mapFromJoinPartyRequest(
                        party,
                        member,
                        partyMember.initialFund,
                        partyMember.signature,
                        request.transactionHash,
                    ),
                    true, // TODO: need to clear this!
                    dbTransaction,
                );

            partyMember.depositTransactionId = depositTransaction.id;
            await partyMember.save({ transaction: dbTransaction });

            party.totalFund = party.totalFund.add(partyMember.initialFund);
            party.totalMember += 1; // TODO: use raw query to increment value
            await party.save({ transaction: dbTransaction });

            await dbTransaction.commit();
            return partyMember;
        } catch (err) {
            await dbTransaction.rollback();
            throw err;
        }
    }

    async delete(
        partyMemberId: string,
        { signature }: DeleteIncompleteData,
    ): Promise<void> {
        const partyMember = await this.getPartyMemberService.getById(
            partyMemberId,
        );

        if (partyMember.signature !== signature)
            throw new UnauthorizedException('Signature not valid');

        if (partyMember.transactionHash)
            throw new UnprocessableEntityException(
                'Join party data already mark as complete data. Are you sure want to delete it?',
            );

        await partyMember.destroy({ force: true });
    }
}
