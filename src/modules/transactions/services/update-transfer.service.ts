import {
    Inject,
    Injectable,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { TransactionModel } from 'src/models/transaction.model';

@Injectable()
export class UpdateTransferService {
    constructor(
        @Inject(Web3Service)
        private readonly web3Service: Web3Service,
    ) {}

    async delete(
        transaction: TransactionModel,
        signature: string,
    ): Promise<void> {
        if (transaction.signature !== signature)
            throw new UnauthorizedException('Signature not valid');

        if (transaction.transactionHash) {
            const transactionReceipt =
                await this.web3Service.getTransactionReceipt(
                    transaction.transactionHash,
                );
            if (transactionReceipt.status)
                throw new UnprocessableEntityException(
                    'This transaction is success. Are you sure want to delete this?',
                );
        }

        await transaction.destroy({ force: true });
    }
}
