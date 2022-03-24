import {
    Injectable,
    Logger,
    UnprocessableEntityException,
} from '@nestjs/common';
import BN from 'bn.js';
import { PartyEvents } from 'src/contracts/Party';
import { Web3Service } from 'src/infrastructure/web3/web3.service';
import { GetPartyService } from 'src/modules/parties/services/get-party.service';

export interface IDecodeResult {
    userAddress: string;
    partyAddress: string;
    amount: BN;
    cut: BN;
    penalty: BN;
    percentage: BN;
}

@Injectable()
export class MeService {
    constructor(
        // inject here
    ) {}

    // write your function here
}
