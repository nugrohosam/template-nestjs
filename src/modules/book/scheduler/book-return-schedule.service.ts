import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class BookReturnSchedule {
    private readonly logger = new Logger(BookReturnSchedule.name);

    @Cron('0 */3 * * * *')
    async handleTask(): Promise<void> {
        // write scheduler here
    }
}
