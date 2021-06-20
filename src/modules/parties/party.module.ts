import { Module } from '@nestjs/common';
import { Web3Module } from 'src/infrastructure/web3/web3.module';
import { PartyController } from './controllers/party.controller';
import { CreatePartyService } from './services/create-party.service';

@Module({
    imports: [Web3Module],
    controllers: [PartyController],
    providers: [CreatePartyService],
})
export class PartyModule {}
