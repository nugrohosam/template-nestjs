import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { TransactionModel } from 'src/models/transaction.model';
import { UpdateTransferRequest } from '../requests/update-transfer.request';
import { depositEvent } from 'src/contracts/DepositEvent.json';
import { AbiItem } from 'web3-utils';

@Injectable()
export class UpdateTransferService {
    constructor(
        @Inject(Web3Service) private readonly web3Service: Web3Service,
    ) {}

    async update(
        transaction: TransactionModel,
        request: UpdateTransferRequest,
    ): Promise<TransactionModel> {
        if (request.transferSignature !== transaction.signature)
            throw new UnauthorizedException('Signature not valid');

        // TODO: need to discuss with sc about which input index used to be indetifier
        await this.web3Service.validateTransaction(
            request.transactionHash,
            transaction.addressFrom,
            depositEvent as AbiItem,
            0,
            transaction.id,
        );

        transaction.transactionHash = request.transactionHash;
        await transaction.save();
        return transaction;
    }
}
