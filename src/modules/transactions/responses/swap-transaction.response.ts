import { ISwapTransaction } from 'src/entities/swap-transaction.entity';
import { SwapTransactionModel } from 'src/models/swap-transaction.model';

export class SwapTransactionResponse
    implements Omit<ISwapTransaction, 'partyId' | 'transactionHash'>
{
    tokenFrom: string;
    tokenTarget: string;
    buyAmount: string;
    sellAmount: string;
    updatedAt?: Date;
    id: string;
    createdAt: Date;

    static mapFromSwapTransactionModel(
        transaction: SwapTransactionModel,
    ): SwapTransactionResponse {
        return {
            id: transaction.id,
            tokenFrom: transaction.tokenFrom,
            tokenTarget: transaction.tokenTarget,
            buyAmount: transaction.buyAmount.toString(),
            sellAmount: transaction.sellAmount.toString(),
            createdAt: transaction.createdAt,
        };
    }
}
