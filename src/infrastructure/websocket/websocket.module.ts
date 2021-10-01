import { Module } from '@nestjs/common';
import { MeModule } from 'src/modules/me/me.module';
import { PartyModule } from 'src/modules/parties/party.module';
import { WebsocketService } from './websocket.service';

@Module({
    imports: [PartyModule, MeModule],
    providers: [WebsocketService],
})
export class WebsocketModule {}
