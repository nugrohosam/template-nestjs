import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { TransactionModel } from 'src/models/transaction.model';
import { UpdateTransferRequest } from '../requests/update-transfer.request';
import { depositEvent } from 'src/contracts/DepositEvent.json';
import { AbiItem } from 'web3-utils';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { PartyModel } from 'src/models/party.model';
import { GetPartyService } from 'src/modules/parties/services/get-party.service';
import { UserModel } from 'src/models/user.model';

@Injectable()
export class UpdateTransferService {
    constructor(
        @Inject(Web3Service) private readonly web3Service: Web3Service,
        @Inject(GetUserService) private readonly getUserService: GetUserService,
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
    ) {}

    async update(
        transaction: TransactionModel,
        request: UpdateTransferRequest,
    ): Promise<TransactionModel> {
        if (request.transferSignature !== transaction.signature)
            throw new UnauthorizedException('Signature not valid');

        let user: UserModel;
        let party: PartyModel;
        if (transaction.type === TransactionTypeEnum.Deposit) {
            user = await this.getUserService.getUserByAddress(
                transaction.addressFrom,
            );
            party = await this.getPartyService.getByAddress(
                transaction.addressTo,
            );
        }

        // TODO: need to discuss with sc about which input index used to be indetifier
        await this.web3Service.validateTransaction(
            request.transactionHash,
            transaction.addressFrom,
            depositEvent as AbiItem,
            [0, 1, 2, 3, 4],
            [
                user.address,
                party.address,
                user.id,
                party.id,
                transaction.amount.toString(),
            ],
        );

        transaction.transactionHash = request.transactionHash;
        await transaction.save();
        return transaction;
    }
}
