import { Injectable } from '@nestjs/common';
import { PartyModel } from 'src/models/party.model';

@Injectable()
export class GenerateSignatureMessage {
    closeParty(party: PartyModel): string {
        const message = `I want to close my party with name ${party.name} with id ${party.id}`;
        console.log(`message[close-party]: ${message}`);
        return message;
    }
}
