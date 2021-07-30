import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize/types';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { localDatabase } from 'src/infrastructure/database/database.provider';
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

    async transfer(
        request: TransferRequest,
        t?: Transaction,
    ): Promise<TransactionModel> {
        const message = await this.generateSignatureMessage(request);
        // TODO: need to removed after testing
        console.log('message[transfer]: ' + message);

        // TODO: need to research about db transaction on sequelize for current pattern

        // begin db transaction, and receive passed transaction if any to used passed transaction instead
        const dbTransaction = await localDatabase.transaction({
            transaction: t,
        });

        try {
            const transaction = await this.storeTransaction(
                request,
                dbTransaction,
            );

            if (transaction.type === TransactionTypeEnum.Deposit) {
                await this.web3Service.validateSignature(
                    request.transferSignature,
                    request.addressFrom,
                    message,
                );

                await this.partyCalculationService.deposit(
                    transaction.addressTo,
                    transaction.addressFrom,
                    transaction.amount,
                    dbTransaction,
                );
            } else if (transaction.type === TransactionTypeEnum.Withdraw) {
                await this.web3Service.validateSignature(
                    request.transferSignature,
                    request.addressTo,
                    message,
                );

                await this.partyCalculationService.withdraw(
                    transaction.addressFrom,
                    transaction.addressTo,
                    transaction.amount,
                    dbTransaction,
                );
            }

            await dbTransaction.commit();
            return transaction;
        } catch (err) {
            await dbTransaction.rollback();
            throw err;
        }
    }
}
