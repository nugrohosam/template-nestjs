import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class PartyGainSchedulerService {
    @Cron('0 0 * * * *')
    handlerTask() {
        console.log('call partyGain service');
    }
}
