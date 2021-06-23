import { Module } from '@nestjs/common';
import { Web3Module } from 'src/infrastructure/web3/web3.module';
import { PartyController } from './controllers/party.controller';
import { CreatePartyService } from './services/create-party.service';
import { IndexPartyService } from './services/index-party.service';
import { UpdateTransactionHashService } from './services/update-transaction-hash.service';

@Module({
    imports: [Web3Module],
    controllers: [PartyController],
    providers: [
        IndexPartyService,
        CreatePartyService,
        UpdateTransactionHashService,
    ],
})
export class PartyModule {}
