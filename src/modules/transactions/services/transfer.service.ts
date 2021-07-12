import { TransactionModel } from 'src/models/transaction.model';
import { TransferRequest } from '../requests/transfer.request';

export class TransferService {
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
            transactionHash: request.transactionHash,
        });
    }

    async transfer(request: TransferRequest): Promise<TransactionModel> {
        // TODO: validate signature
        // TODO: validate transaction hash

        return await this.storeTransaction(request);
    }
}
