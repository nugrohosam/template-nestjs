import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { config } from 'src/config';

@Injectable()
export class TransactionSyncSchedulerService {
    private readonly logger = new Logger(TransactionSyncSchedulerService.name);

    constructor(
        // inject your service here
    ) {}

    @Cron('0 */3 * * * *')
    async handleTask(): Promise<void> {

        // write scheduler here

    }
}
