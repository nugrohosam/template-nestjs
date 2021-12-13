import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TransactionSyncRetrialService } from '../services/transaction-sync-retrial.service';
import { config } from 'src/config';

@Injectable()
export class TransactionSyncSchedulerService {
    private readonly logger = new Logger(TransactionSyncSchedulerService.name);

    constructor(
        private readonly transactionSyncRetrialService: TransactionSyncRetrialService,
    ) {}

    @Cron('0 */3 * * * *')
    async handleTask(): Promise<void> {
        if (!config.scheduler.transactionSyncRetrial) return;

        this.logger.debug('------ PROCESSING TRANSACTION_SYNC SERVICE ------');
        await this.transactionSyncRetrialService.retry();
        this.logger.debug(
            '------ END PROCESSING TRANSACTION_SYNC SERVICE ------',
        );
    }
}
