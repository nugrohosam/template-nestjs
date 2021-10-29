import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { config } from 'src/config';
import { PartyGainService } from '../services/party-gain/party-gain.service';

@Injectable()
export class PartyGainSchedulerService {
    private readonly logger = new Logger(PartyGainSchedulerService.name);

    constructor(private readonly partyGainService: PartyGainService) {}

    @Cron('0 */5 * * * *')
    handlerTask(): void {
        if (!config.scheduler.partyGain) return;

        this.logger.debug('------ PROCESSING PARTY_GAIN SERVICE ------');
        this.partyGainService.updatePartiesGain();
        this.logger.debug('------ END PROCESSING PARTY_GAIN SERVICE ------');
    }
}
