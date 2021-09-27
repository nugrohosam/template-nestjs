import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PartyGainService } from '../services/party-gain/party-gain.service';

@Injectable()
export class PartyGainSchedulerService {
    constructor(private readonly partyGainService: PartyGainService) {}
    @Cron('0 0 * * * *')
    handlerTask() {
        console.log('call partyGain service');
        this.partyGainService.updatePartiesGain();
    }
}
