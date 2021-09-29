import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PartyGainService } from '../services/party-gain/party-gain.service';

@Injectable()
export class PartyGainSchedulerService {
    private readonly logger = new Logger(PartyGainSchedulerService.name);
    constructor(private readonly partyGainService: PartyGainService) {}
    @Cron('0 * * * * *')
    handlerTask() {
        this.logger.debug('------ PROCESSING PARTY_GAIN SERVICE');
        this.partyGainService.updatePartiesGain();
    }
}
