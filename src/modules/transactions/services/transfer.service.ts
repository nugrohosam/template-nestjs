import { Inject, Injectable } from '@nestjs/common';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { TransactionModel } from 'src/models/transaction.model';
import { GetPartyService } from 'src/modules/parties/services/get-party.service';
import { PartyCalculationService } from 'src/modules/parties/services/party-calculation.service';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { TransferRequest } from '../requests/transfer.request';

@Injectable()
export class TransferService {
    constructor(
        @Inject(Web3Service) private readonly web3Service: Web3Service,
        @Inject(GetUserService) private readonly getUserService: GetUserService,
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
        @Inject(PartyCalculationService)
        private readonly partyCalculationService: PartyCalculationService,
    ) {}

    async generateSignatureMessage(request: TransferRequest): Promise<string> {
        const fromUser = await this.getUserService.getUserByAddress(
            request.addressFrom,
        );
        const party = await this.getPartyService.getByAddress(
            request.addressTo,
        );
        return this.web3Service.soliditySha3([
            { t: 'address', v: request.addressFrom },
            { t: 'string', v: fromUser.id },
            { t: 'address', v: request.addressTo },
            { t: 'string', v: party.id },
            { t: 'uint256', v: request.amount.toString() },
        ]);
    }

    async storeTransaction(
        request: TransferRequest,
    ): Promise<TransactionModel> {
        return await TransactionModel.create({
            addressFrom: request.addressFrom,
            addressTo: request.addressTo,
            amount: request.amount,
            currencyId: request.currencyId,
            type: request.type,
            description: request.description,
            signature: request.transferSignature,
        });
    }

    async transfer(request: TransferRequest): Promise<TransactionModel> {
        const message = await this.generateSignatureMessage(request);
        // TODO: need to removed after testing
        console.log('message[platform-create-party]: ' + message);

        await this.web3Service.validateSignature(
            request.transferSignature,
            request.addressFrom,
            message,
        );

        const transaction = await this.storeTransaction(request);
        if (transaction.type === TransactionTypeEnum.Deposit) {
            await this.partyCalculationService.deposit(
                transaction.addressTo,
                transaction.addressFrom,
                transaction.amount,
            );
        }

        return transaction;
    }
}
