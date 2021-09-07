import {
    Inject,
    Injectable,
    UnprocessableEntityException,
} from '@nestjs/common';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { PartyModel } from 'src/models/party.model';
import { TransactionModel } from 'src/models/transaction.model';
import { UserModel } from 'src/models/user.model';
import { GetPartyService } from 'src/modules/parties/services/get-party.service';
import { GetUserService } from 'src/modules/users/services/get-user.service';
import { TransferRequest } from '../requests/transfer.request';
import { depositEvent } from 'src/contracts/DepositEvent.json';
import { withdrawEvent } from 'src/contracts/WithdrawEvent.json';
import { AbiItem } from 'web3-utils';
import { PartyCalculationService } from 'src/modules/parties/services/party-calculation.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TransferService {
    constructor(
        @InjectRepository(TransactionModel)
        private readonly repository: Repository<TransactionModel>,
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
        @Inject(GetUserService)
        private readonly getUserService: GetUserService,
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
        @Inject(PartyCalculationService)
        private readonly partyCalculationService: PartyCalculationService,
    ) {}

    private async generateSignatureMessage(
        request: TransferRequest,
    ): Promise<string> {
        const partyAddress =
            request.type === TransactionTypeEnum.Withdraw
                ? request.addressFrom,
                : request.addressTo;

        const party = await this.getPartyService.getByAddress(partyAddress);

        return `I want to ${request.type} money at ${party.name} with amount of ${request.amount} mwei`;
    }

    private async getUserAndParty(request: TransferRequest): Promise<{
        user: UserModel;
        party: PartyModel;
    }> {
        let user: UserModel;
        let party: PartyModel;

        if (request.type === TransactionTypeEnum.Deposit) {
            user = await this.getUserService.getUserByAddress(
                request.addressFrom,
            );
            party = await this.getPartyService.getByAddress(request.addressTo);
        } else if (request.type === TransactionTypeEnum.Withdraw) {
            user = await this.getUserService.getUserByAddress(
                request.addressTo,
            );
            party = await this.getPartyService.getByAddress(
                request.addressFrom,
            );
        } else {
            throw new UnprocessableEntityException('Transfer type not valid');
        }

        return { user, party };
    }

    private getAbiItem({ type }: TransferRequest): AbiItem {
        let abiItem: Record<string, any>;

        switch (type) {
            case TransactionTypeEnum.Deposit:
                abiItem = depositEvent;
                break;
            case TransactionTypeEnum.Withdraw:
                abiItem = withdrawEvent;
                break;
            default:
                abiItem = depositEvent;
                break;
        }

        return abiItem as AbiItem;
    }

    async storeTransaction(
        request: TransferRequest,
        transactionStatus: boolean,
    ): Promise<TransactionModel> {
        let transaction: TransactionModel = await this.repository.findOne({
            where: { transactionHash: request.transactionHash },
        });

        if (!transaction) {
            transaction = this.repository.create({
                addressFrom: request.addressFrom,
                addressTo: request.addressTo,
                amount: request.amount,
                currencyId: request.currencyId,
                type: request.type,
                description: request.description,
                signature: request.signature,
                transactionHash: request.transactionHash,
                transactionHashStatus: transactionStatus,
            });
        } else {
            await this.repository.update(
                { id: transaction.id },
                {
                    addressFrom: request.addressFrom,
                    addressTo: request.addressTo,
                    amount: request.amount,
                    currencyId: request.currencyId,
                    type: request.type,
                    description: request.description,
                    signature: request.signature,
                    transactionHash: request.transactionHash,
                    transactionHashStatus: transactionStatus,
                },
            );
        }

        return transaction;
    }

    private async processTransaferCalculation(
        transaction: TransactionModel,
    ): Promise<void> {
        if (transaction.type === TransactionTypeEnum.Deposit) {
            await this.partyCalculationService.deposit(
                transaction.addressTo,
                transaction.addressFrom,
                transaction.amount,
            );
        } else if (transaction.type === TransactionTypeEnum.Withdraw) {
            await this.partyCalculationService.withdraw(
                transaction.addressFrom,
                transaction.addressTo,
                transaction.amount,
            );
        }
    }

    async transfer(request: TransferRequest): Promise<TransactionModel> {
        const { user, party } = await this.getUserAndParty(request);

        const message = await this.generateSignatureMessage(request);
        // TODO: need to removed after testing
        console.log('message[transfer]: ' + message);
        await this.web3Service.validateSignature(
            request.signature,
            user.address,
            message,
        );

        const abiItem = this.getAbiItem(request);

        const transactionStatus = await this.web3Service.validateTransaction(
            request.transactionHash,
            user.address,
            abiItem as AbiItem,
            { 0: user.address, 1: party.address, 2: request.amount.toString() },
        );

        const transaction = await this.storeTransaction(
            request,
            transactionStatus,
        );

        if (transactionStatus)
            await this.processTransaferCalculation(transaction);

        return transaction;
    }
}
