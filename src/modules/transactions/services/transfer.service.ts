import {
    Inject,
    Injectable,
    UnprocessableEntityException,
} from '@nestjs/common';
import { Transaction } from 'sequelize/types';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { TransactionModel } from 'src/models/transaction.model';
import { GetPartyService } from 'src/modules/parties/services/get-party.service';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { TransferRequest } from '../requests/transfer.request';

@Injectable()
export class TransferService {
    constructor(
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
        @Inject(GetUserService)
        private readonly getUserService: GetUserService,
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
    ) {}

    async generateSignatureMessage(request: TransferRequest): Promise<string> {
        const partyAddress =
            request.type === TransactionTypeEnum.Withdraw
                ? request.addressFrom
                : request.addressTo;

        const party = await this.getPartyService.getByAddress(partyAddress);

        return `I want to ${request.type} money at ${party.name} with amount of ${request.amount} mwei`;
    }

    async storeTransaction(
        request: TransferRequest,
        t?: Transaction,
    ): Promise<TransactionModel> {
        return await TransactionModel.create(
            {
                addressFrom: request.addressFrom,
                addressTo: request.addressTo,
                amount: request.amount,
                currencyId: request.currencyId,
                type: request.type,
                description: request.description,
                signature: request.transferSignature,
            },
            { transaction: t },
        );
    }

    async transfer(request: TransferRequest): Promise<TransactionModel> {
        const message = await this.generateSignatureMessage(request);
        // TODO: need to removed after testing
        console.log('message[transfer]: ' + message);

        if (request.type === TransactionTypeEnum.Deposit) {
            await this.web3Service.validateSignature(
                request.transferSignature,
                request.addressFrom,
                message,
            );
        } else if (request.type === TransactionTypeEnum.Withdraw) {
            await this.web3Service.validateSignature(
                request.transferSignature,
                request.addressTo,
                message,
            );
        } else {
            throw new UnprocessableEntityException('Transfer type not valid');
        }

        const transaction = await this.storeTransaction(request);

        return transaction;
    }
}
