import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ITransaction } from 'src/entities/transaction.entity';
import { PartyMemberModel } from 'src/models/party-member.model';
import { TransactionModel } from 'src/models/transaction.model';
import BN from 'bn.js';
import { PartyCalculationService } from 'src/modules/parties/services/party-calculation.service';
import { TokenService } from 'src/modules/parties/services/token/token.service';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { config } from 'src/config';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class TransactionService {
    constructor(
        @InjectRepository(TransactionModel)
        private readonly repository: Repository<TransactionModel>,

        private readonly partyCalculationService: PartyCalculationService,
        private readonly tokenService: TokenService,
    ) {}

    async store(data: ITransaction): Promise<TransactionModel> {
        const transaction = this.repository.create(data);
        return await this.repository.save(transaction);
    }

    async update(
        transaction: TransactionModel,
        data: ITransaction,
    ): Promise<TransactionModel> {
        transaction = Object.assign(transaction, data);
        this.repository.save(transaction);
        return transaction;
    }

    async storeDepositTransaction(
        partyMember: PartyMemberModel,
        amount: BN,
        signature: string,
        transactionHash: string,
    ): Promise<TransactionModel> {
        const member = partyMember.member ?? (await partyMember.getMember);
        const party = partyMember.party ?? (await partyMember.getParty);
        const token = await this.tokenService.getDefaultToken();

        // store deposit transaction log
        const transaction = await this.store({
            addressFrom: member.address,
            addressTo: party.address,
            amount: amount,
            currencyId: token.id,
            type: TransactionTypeEnum.Deposit,
            signature: signature,
            transactionHash: transactionHash,
            transactionHashStatus: true,
            description: 'Initial Deposit',
        });

        // store cut transaction for deposit
        const chargeAmount =
            this.partyCalculationService.getChargeAmount(amount);
        await this.store({
            addressFrom: member.address,
            addressTo: config.platform.address,
            type: TransactionTypeEnum.Charge,
            currencyId: token.id,
            amount: chargeAmount,
            description: `Charge of deposit transaction from ${member.address} to party ${party.address}`,
            signature: signature,
            transactionHash: transactionHash,
            transactionHashStatus: true,
        });

        return transaction;
    }

    async updateTxHashStatus(
        txhash: string,
        status: boolean,
    ): Promise<UpdateResult> {
        return this.repository
            .createQueryBuilder()
            .update(TransactionModel)
            .set({ transactionHashStatus: status })
            .where('transaction_hash = :transaction_hash', {
                transaction_hash: txhash,
            })
            .execute();
    }
}
