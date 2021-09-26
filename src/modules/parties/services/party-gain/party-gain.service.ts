import { Injectable } from '@nestjs/common';
import { GetTokenPriceService } from '../token/get-token-price.service';

@Injectable()
export class PartyGainService {
    constructor(private readonly getTokenPriceService: GetTokenPriceService) {}

    updatePartiesGain() {
        // get all party (optimize with chunk)
        // add to queue
        // do getTokenPriceService
        // get party total value in usd
        // update to DB
    }
}
