import {
    Inject,
    Injectable,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
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
import { PartyCalculationService } from 'src/modules/parties/services/party-calculation.service';
import { Transaction } from 'sequelize';
import { localDatabase } from 'src/infrastructure/database/database.provider';

@Injectable()
export class UpdateTransferService {
    constructor(
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
        @Inject(GetUserService)
        private readonly getUserService: GetUserService,
        @Inject(GetPartyService)
        private readonly getPartyService: GetPartyService,
        @Inject(PartyCalculationService)
        private readonly partyCalculationService: PartyCalculationService,
    ) {}

    async processTransaferCalculation(
        transaction: TransactionModel,
        dbTransaction?: Transaction,
    ): Promise<void> {
        if (transaction.type === TransactionTypeEnum.Deposit) {
            await this.partyCalculationService.deposit(
                transaction.addressTo,
                transaction.addressFrom,
                transaction.amount,
                dbTransaction,
            );
        } else if (transaction.type === TransactionTypeEnum.Withdraw) {
            await this.partyCalculationService.withdraw(
                transaction.addressFrom,
                transaction.addressTo,
                transaction.amount,
                dbTransaction,
            );
        }
    }

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

        const dbTransaction = await localDatabase.transaction();

        try {
            transaction.transactionHash = request.transactionHash;
            await transaction.save();

            await this.processTransaferCalculation(transaction, dbTransaction);

            await dbTransaction.commit();
            return transaction;
        } catch (err) {
            await dbTransaction.rollback();
            throw err;
        }
    }

    async delete(
        transaction: TransactionModel,
        signature: string,
    ): Promise<void> {
        if (transaction.signature !== signature)
            throw new UnauthorizedException('Signature not valid');

        if (transaction.transactionHash)
            throw new UnprocessableEntityException(
                'Transaction data already marked as complete data. Are you sure want to delete this data?',
            );

        await transaction.destroy({ force: true });
    }
}
