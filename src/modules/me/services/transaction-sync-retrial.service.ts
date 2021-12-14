import { Injectable } from '@nestjs/common';
import { PartyEvents } from 'src/contracts/Party';
import {
    SyncEnumOptions,
    TransactionSyncService,
} from 'src/modules/transactions/services/transaction-sync.service';
import { ClosePartyApplication } from '../applications/close-party.application';
import { LeavePartyApplication } from '../applications/leave-party.application';
import { WithdrawAllApplication } from '../applications/withdraw-all.application';
import { WithdrawApplication } from '../applications/withdraw.application';

@Injectable()
export class TransactionSyncRetrialService {
    constructor(
        private readonly transactionSyncService: TransactionSyncService,
        private readonly withdrawAllService: WithdrawAllApplication,
        private readonly withdrawService: WithdrawApplication,
        private readonly leavePartyApplication: LeavePartyApplication,
        private readonly closePartyApplication: ClosePartyApplication,
    ) {}

    async retry(): Promise<any> {
        const data = await this.transactionSyncService.get(
            SyncEnumOptions.IsNotSync,
        );

        if (!data) return;

        for await (const transactionSync of data) {
            switch (transactionSync.eventName) {
                case PartyEvents.WithdrawAllEvent:
                    await this.withdrawAllService.retrySync(
                        transactionSync.transactionHash,
                    );
                    break;
                case PartyEvents.WithdrawEvent:
                    await this.withdrawService.retrySync(
                        transactionSync.transactionHash,
                    );
                    break;
                case PartyEvents.LeavePartyEvent:
                    await this.leavePartyApplication.retrySync(
                        transactionSync.transactionHash,
                    );
                    break;
                case PartyEvents.ClosePartyEvent:
                    await this.closePartyApplication.retrySync(
                        transactionSync.transactionHash,
                    );
                    break;
                default:
                    break;
            }
        }
    }
}
