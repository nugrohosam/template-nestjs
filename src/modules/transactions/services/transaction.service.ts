import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ITransaction } from 'src/entities/transaction.entity';
import { PartyMemberModel } from 'src/models/party-member.model';
import { TransactionModel } from 'src/models/transaction.model';
import { Repository } from 'typeorm';
import BN from 'bn.js';
import { PartyCalculationService } from 'src/modules/parties/services/party-calculation.service';
import { TokenService } from 'src/modules/parties/services/token/token.service';
import { TransactionTypeEnum } from 'src/common/enums/transaction.enum';
import { config } from 'src/config';

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
            signature: partyMember.signature,
            transactionHash: partyMember.transactionHash,
            transactionHashStatus: true,
            description: 'Initial Deposit',
        });

        // store cut transaction for deposit
        const cutAmount = this.partyCalculationService.getCutAmount(amount);
        await this.store({
            addressFrom: member.address,
            addressTo: config.platform.address,
            type: TransactionTypeEnum.Charge,
            currencyId: token.id,
            amount: cutAmount,
            description: `Charge of deposit transaction from ${member.address} to party ${party.address}`,
            signature: partyMember.signature,
            transactionHash: partyMember.transactionHash,
            transactionHashStatus: true,
        });

        return transaction;
    }
}
